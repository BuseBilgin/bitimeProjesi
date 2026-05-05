const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const appleSigninAuth = require('apple-signin-auth');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const createJwtForUser = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

class AuthController {
  async register(req, res) {
    try {
      const { name = '', email, password, allergies = [] } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const existingUser = await User.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userId = await User.create({ name, email: normalizedEmail, password, allergies });
      res.status(201).json({ message: 'User created', userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const token = createJwtForUser(user);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async socialGoogleLogin(req, res) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured' });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const email = payload?.email;
      const emailVerified = payload?.email_verified;

      if (!email || !emailVerified) {
        return res.status(400).json({ error: 'Google account email is missing or not verified' });
      }

      let user = await User.findByEmail(email);

      if (!user) {
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const userId = await User.create({
          name: payload?.name || 'Google User',
          email,
          password: randomPassword,
          allergies: []
        });
        user = await User.findById(userId);
      }

      const token = createJwtForUser(user);
      res.json({ token, provider: 'google' });
    } catch (error) {
      res.status(400).json({ error: 'Invalid Google token' });
    }
  }

  async socialAppleLogin(req, res) {
    try {
      const { idToken, nonce, email: emailFromClient, name: nameFromClient } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
      }

      if (!process.env.APPLE_CLIENT_ID) {
        return res.status(500).json({ error: 'APPLE_CLIENT_ID is not configured' });
      }

      const payload = await appleSigninAuth.verifyIdToken(idToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
        nonce: nonce || undefined
      });

      const email = payload?.email || emailFromClient;
      if (!email) {
        return res.status(400).json({ error: 'Apple email is missing. Provide email from client on first login.' });
      }

      let user = await User.findByEmail(email);

      if (!user) {
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const userId = await User.create({
          name: nameFromClient || 'Apple User',
          email,
          password: randomPassword,
          allergies: []
        });
        user = await User.findById(userId);
      }

      const token = createJwtForUser(user);
      res.json({ token, provider: 'apple' });
    } catch (error) {
      res.status(400).json({ error: 'Invalid Apple token' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete user.password;
      if (typeof user.allergies === 'string') {
        try {
          user.allergies = JSON.parse(user.allergies);
        } catch (e) {
          user.allergies = [];
        }
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email, allergies } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await User.update(req.user.id, { name: name ?? user.name, email: email ?? user.email, allergies: allergies ?? (user.allergies || []) });
      res.json({ message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();