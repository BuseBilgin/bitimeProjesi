// src/middleware/rateLimiter.js
// API rate limiting - DoS saldırılarını ve abuse'u önle

const rateLimit = require('express-rate-limit');

/**
 * Login denemelerini sınırla
 * 15 dakika içinde maksimum 5 deneme
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // maksimum 5 istek
  message: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyiniz.',
  standardHeaders: true, // RateLimit-* headers döndür
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // IP adresine ve email'e göre rate limiting (brute force atağını zor hale getirir)
    return `${req.ip}:${req.body.email || 'unknown'}`;
  },
  skip: (req, res) => {
    // Sağlık kontrolü, etc. sınırlamadan geç
    return req.path === '/health';
  },
  store: undefined // Memory store default (production'da Redis kullan)
});

/**
 * İlaç araması rate limiting
 * 1 dakika içinde maksimum 30 arama
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 30,
  message: 'Çok fazla arama isteği. Lütfen biraz bekleyiniz.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * API genel rate limiting
 * 1 saatte maksimum 100 istek (authenticated users)
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 100,
  message: 'API istek limitine ulaştınız. Lütfen daha sonra tekrar deneyiniz.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Sosyal giriş rate limiting (malicious OAuth token creation prevent)
 * 1 saatte maksimum 10 sosyal giriş
 */
const socialAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  message: 'Çok fazla sosyal giriş denemesi. Lütfen daha sonra tekrar deneyiniz.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Kayıt rate limiting (account creation spam prevent)
 * 1 gün içinde IP başına maksimum 5 hesap oluştur
 */
const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 saat
  max: 5,
  message: 'Çok fazla hesap oluşturma denemesi. Lütfen daha sonra tekrar deneyiniz.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Email based limiting to prevent bulk registration
    return `${req.ip}:${req.body.email || 'unknown'}`;
  }
});

module.exports = {
  loginLimiter,
  searchLimiter,
  apiLimiter,
  socialAuthLimiter,
  registerLimiter
};
