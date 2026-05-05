// src/middleware/errorHandler.js
// Merkezi hata yönetimi middleware'i

class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Beklenmeyen bir hata oluştu';

  // Production'da sensitif bilgi gösterme
  const isProduction = process.env.NODE_ENV === 'production';
  if (statusCode === 500 && isProduction) {
    message = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
  }

  // Stack trace logging (yalnızca production değilse)
  if (!isProduction) {
    console.error(`[${code}] ${err.message}`);
    console.error(err.stack);
  } else {
    console.error(`[${code}] ${message}`);
  }

  // Response format standardizasyonu
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details && { details: err.details }),
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { path: req.path })
    }
  });
};

// Async middleware hata yakalayıcı (wrapper)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler
};
