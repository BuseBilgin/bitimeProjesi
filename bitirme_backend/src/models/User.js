const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/database');
const bcrypt = require('bcrypt');

const fallbackUsersPath = path.join(__dirname, '../../data/fallback-users.json');

async function readFallbackUsers() {
  try {
    const content = await fs.readFile(fallbackUsersPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeFallbackUsers(users) {
  await fs.mkdir(path.dirname(fallbackUsersPath), { recursive: true });
  await fs.writeFile(fallbackUsersPath, JSON.stringify(users, null, 2));
}

function shouldUseFallback(error) {
  return (
    error?.code === 'ER_ACCESS_DENIED_ERROR' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'PROTOCOL_CONNECTION_LOST'
  );
}

class User {
  static async create(userData) {
    const { name, email, password, allergies } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.execute(
        'INSERT INTO pill_reminder_users (name, email, password, allergies) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, JSON.stringify(allergies)]
      );
      return result.insertId;
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const users = await readFallbackUsers();
      const nextId = users.length ? Math.max(...users.map((user) => Number(user.id) || 0)) + 1 : 1;

      users.push({
        id: nextId,
        name,
        email,
        password: hashedPassword,
        allergies: Array.isArray(allergies) ? allergies : [],
      });

      await writeFallbackUsers(users);
      return nextId;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM pill_reminder_users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const users = await readFallbackUsers();
      return users.find((user) => user.email === email);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM pill_reminder_users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const users = await readFallbackUsers();
      return users.find((user) => Number(user.id) === Number(id));
    }
  }

  static async update(id, userData) {
    const { name, email, allergies } = userData;

    try {
      await pool.execute(
        'UPDATE pill_reminder_users SET name = ?, email = ?, allergies = ? WHERE id = ?',
        [name, email, JSON.stringify(allergies), id]
      );
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const users = await readFallbackUsers();
      const userIndex = users.findIndex((user) => Number(user.id) === Number(id));

      if (userIndex === -1) {
        return;
      }

      users[userIndex] = {
        ...users[userIndex],
        name,
        email,
        allergies: Array.isArray(allergies) ? allergies : [],
      };

      await writeFallbackUsers(users);
    }
  }
}

module.exports = User;