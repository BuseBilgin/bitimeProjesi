// src/middleware/validation.js
// İnput doğrulama middleware'i - XSS ve injection saldırılarını önle

const validateRegister = (req, res, next) => {
  const { name, email, password, allergies } = req.body;

  // Email format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      error: 'Geçersiz email formatı',
      code: 'INVALID_EMAIL'
    });
  }

  // Password zorunluluğu ve uzunluğu
  if (!password || password.length < 8) {
    return res.status(400).json({
      error: 'Şifre en az 8 karakter olmalıdır',
      code: 'WEAK_PASSWORD'
    });
  }

  // Password complexity: en az 1 büyük harf, 1 sayı, 1 özel karakter
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
      error: 'Şifre en az bir büyük harfi barındırmalıdır (A-Z)',
      code: 'WEAK_PASSWORD'
    });
  }

  if (!/[0-9]/.test(password)) {
    return res.status(400).json({
      error: 'Şifre en az bir sayı içermelidir (0-9)',
      code: 'WEAK_PASSWORD'
    });
  }

  // Name uzunluğu
  if (name && name.length > 100) {
    return res.status(400).json({
      error: 'Ad çok uzun (maksimum 100 karakter)',
      code: 'INVALID_NAME'
    });
  }

  // HTML/Script injection kontrolü (XSS koruması)
  if (/<[^>]*>/.test(String(name || '')) || /<[^>]*>/.test(email)) {
    return res.status(400).json({
      error: 'Geçersiz karakterler detected',
      code: 'INVALID_INPUT'
    });
  }

  // Allergies array validasyonu
  if (allergies && Array.isArray(allergies)) {
    for (const allergy of allergies) {
      if (typeof allergy !== 'string' || allergy.length > 50) {
        return res.status(400).json({
          error: 'Alerji formatı hatalı',
          code: 'INVALID_ALLERGIES'
        });
      }
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email ve şifre gereklidir',
      code: 'MISSING_CREDENTIALS'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      error: 'Geçersiz email formatı',
      code: 'INVALID_EMAIL'
    });
  }

  next();
};

const validateSearchQuery = (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: 'Arama sorgusu gereklidir',
      code: 'MISSING_QUERY'
    });
  }

  const queryStr = String(query).trim();
  
  if (queryStr.length < 2) {
    return res.status(400).json({
      error: 'Arama sorgusu en az 2 karakter olmalıdır',
      code: 'QUERY_TOO_SHORT'
    });
  }

  if (queryStr.length > 100) {
    return res.status(400).json({
      error: 'Arama sorgusu çok uzun (maksimum 100 karakter)',
      code: 'QUERY_TOO_LONG'
    });
  }

  // SQL injection ve XSS koruması
  if (/<[^>]*>|['";`]|--|\/\*|\*\/|xp_|sp_/.test(queryStr)) {
    return res.status(400).json({
      error: 'Geçersiz karakterler sorguya eklenemez',
      code: 'INVALID_QUERY'
    });
  }

  next();
};

const validateMedicationAdd = (req, res, next) => {
  const { name, dosage, frequency } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'İlaç adı gereklidir',
      code: 'MISSING_MEDICATION_NAME'
    });
  }

  if (String(name).length > 100) {
    return res.status(400).json({
      error: 'İlaç adı çok uzun (maksimum 100 karakter)',
      code: 'INVALID_MEDICATION_NAME'
    });
  }

  // Dosage optional ama var ise format kontrol et
  if (dosage && String(dosage).length > 50) {
    return res.status(400).json({
      error: 'Doz formatı çok uzun',
      code: 'INVALID_DOSAGE'
    });
  }

  // Frequency optional ama var ise format kontrol et
  if (frequency && !['daily', 'weekly', 'monthly', 'as-needed'].includes(frequency)) {
    return res.status(400).json({
      error: 'Frekans geçersiz (daily, weekly, monthly, as-needed)',
      code: 'INVALID_FREQUENCY'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSearchQuery,
  validateMedicationAdd
};
