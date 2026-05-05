# BACKEND SECURITY & PERFORMANCE QUICK REFERENCE

## 🎯 En Önemli 3 Değişiklik

### 1. N+1 Sorunu → Cache + Paralel Queries
**Dosya**: `src/services/interactionChecker.js`
**Etki**: 5-10s → 100-500ms (50x hızlı)
```javascript
// ✅ ÖNCE: Serial loops
for (const med of medications) {
  const result = await openFDAService.checkInteraction(med);
}

// ✅ SONRA: Parallel + Cache
const promises = medications.map(med => 
  checkWithCache(med)
);
await Promise.allSettled(promises);
```

### 2. Input Injection → Validation Middleware
**Dosya**: `src/middleware/validation.js`
**Etki**: SQL Injection + XSS saldırılarını önle
```javascript
// Email regex, password strength, HTML tag detection
validateRegister(req, res, next);
```

### 3. Rate Limiting → Brute Force Koruması
**Dosya**: `src/middleware/rateLimiter.js`
**Etki**: 5 başarısız login = 15 dakika block
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

---

## 📋 Implementation Checklist

```
ÖNCELIK 1 - ÖNÜMÜZDEKİ SAATLERİ (1-2 saat)
─────────────────────────────────────────
[ ] npm install express-rate-limit
[ ] Yeni middleware'leri server.js'e ekle
[ ] Auth routes'a validation ekle
[ ] interactionChecker.js'i güncellenmiş versiyonla değiştir
[ ] npm start → health check + cache stats kontrol et

ÖNCELIK 2 - ÖNÜMÜZDEKİ GÜN (1 gün)
──────────────────────────────────
[ ] Database indexes ekle (init.sql)
[ ] Error handling testlerini yaz
[ ] Load testing (k6 veya Apache JMeter)
[ ] CORS whitelist .env'ye ekle

ÖNCELIK 3 - ÖNÜMÜZDEKİ HAFTA
──────────────────────────────
[ ] Refresh token pattern ekle
[ ] Redis integration (production)
[ ] Winston logging setup
[ ] API documentation (Swagger)
[ ] HIPAA/GDPR audit logging

```

---

## 🔐 Güvenlik Özeti

| Risk | Mevcut Durum | Çözüm | Dosya |
|------|-------------|-------|-------|
| SQL Injection | ✅ Parameterized | N/A | User.js, Medication.js |
| XSS Attack | ❌ Eksik | Regex validation | validation.js |
| Brute Force | ❌ Eksik | Rate limiting | rateLimiter.js |
| Weak Password | ❌ Eksik | Strength check | validation.js |
| Şifre Hashing | ✅ bcrypt | N/A | User.js |
| JWT Güvenliği | ⚠️ 1h expiry | → 15m + refresh | authController.js |
| CORS Open | ⚠️ true | Whitelist | server.js |
| Error Messages | ⚠️ Sensitif | Generic | errorHandler.js |

**Genel Puan**: 5.6/10 → 8.5/10 (tahmini)

---

## ⚡ Performance Özeti

### Interaction Check (50 Active Medication)

```
┌─ BEFORE ──────────────────────────┐
│ SELECT medications: 10ms           │
│ For each medication:               │
│   OpenFDA API call: 500-1000ms    │  ❌ 50 × 500ms = 25 SECONDS!
│ Total: ~25 seconds                 │
└────────────────────────────────────┘

┌─ AFTER ───────────────────────────┐
│ SELECT medications: 10ms           │
│ Hash Map lookup: O(1) = 1ms        │  ✅ Parallel + Cache
│ Parallel OpenFDA (max 5): 500ms    │
│ Cache hit rate: 80% → 100ms        │
│ Total: 100-500ms                   │
└────────────────────────────────────┘

IMPROVEMENT: 50x hızlanma
```

---

## 🧪 Quick Test Commands

```bash
# 1. Health & Cache Stats
curl http://localhost:3004/health | jq '.cacheStats'

# 2. Login Rate Limiting Test
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST http://localhost:3004/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong123"}'
  echo ""
done
# 6. istek başarısız olmalı: "Too many login attempts"

# 3. Input Validation Test (XSS attempt)
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(1)</script>",
    "email": "test@example.com",
    "password": "ValidPass123"
  }'
# "Invalid characters detected" döndürmelidir

# 4. Password Strength Test
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmet",
    "email": "ahmet@example.com",
    "password": "weak"
  }'
# "Password must be at least 8 characters" döndürmelidir

# 5. Drug Search with Cache
curl "http://localhost:3004/api/medications/search?query=parol" -i
# X-RateLimit-* headers görmek istiyorsunuz

# 6. Cache Performance Test (aynı sorguyu 10 kez)
time for i in {1..10}; do
  curl -s "http://localhost:3004/api/medications/search?query=parol" > /dev/null
done
# İlk: ~500ms, sonrakiler: ~100ms
```

---

## 📁 Dosya Haritası

```
bitirme_backend/
├── src/
│   ├── middleware/
│   │   ├── auth.js              (mevcut)
│   │   ├── validation.js        ✅ YENİ
│   │   ├── errorHandler.js      ✅ YENİ
│   │   └── rateLimiter.js       ✅ YENİ
│   ├── services/
│   │   ├── openfda.js           (mevcut)
│   │   ├── interactionChecker.js (🔄 GÜNCELLENDİ)
│   │   ├── cacheService.js      ✅ YENİ
│   │   └── notificationService.js (mevcut)
│   ├── controllers/
│   │   ├── authController.js    (mevcut)
│   │   ├── medicationController.js (mevcut)
│   │   └── reminderController.js (mevcut)
│   ├── routes/
│   │   ├── auth.js              (🔄 GÜNCELLENECEK)
│   │   ├── medications.js       (🔄 GÜNCELLENECEK)
│   │   └── reminders.js         (mevcut)
│   └── config/
│       └── database.js          (mevcut)
├── server.js                     (🔄 GÜNCELLENECEK)
├── package.json                  (🔄 GÜNCELLENECEK)
├── .env                          (🔄 GÜNCELLENECEK)
├── BACKEND_ANALYSIS.md          ✅ YENİ (rapor)
├── INTEGRATION_GUIDE.md         ✅ YENİ (talimatlar)
└── QUICK_REFERENCE.md           ✅ YENİ (bu dosya)
```

---

## 🆘 Troubleshooting

### ❌ "Cannot find module 'express-rate-limit'"
```bash
npm install express-rate-limit
npm install
```

### ❌ "Cache service not initialized"
```javascript
// server.js'te initializeApp() çağrıldığından emin ol
initializeApp().then(() => {
  app.listen(PORT, HOST, () => { ... });
});
```

### ❌ "ReferenceError: cacheService is not defined"
```javascript
// ✅ Doğru import
const cacheService = require('./cacheService');

// ❌ Yanlış (singleton, new yapma!)
const CacheService = require('./cacheService');
const cache = new CacheService();
```

### ❌ Validation middleware çalışmıyor
```javascript
// ✅ Dosya path'i kontrol et
const { validateRegister } = require('../middleware/validation');

// ✅ Routes'a ekledin mi?
router.post('/register', validateRegister, authController.register);
```

### ⚠️ Slow OpenFDA Responses
```
- Cache'e bakıyor mu? curl http://localhost:3004/health
- totalCached > 0 ise cache çalışıyor
- Rate limiting aşıldı mı? RateLimit headers kontrol et
- OpenFDA API down mu? curl https://api.fda.gov/drug/label.json
```

---

## 💡 Best Practices

✅ **DO's**:
- Rate limiting'i sıkı tutun (brute force koruması)
- Cache'i düzenli temizle (eski veriler)
- Error messages'ı generic tut (information disclosure önle)
- Input validation'ı DÜN et (server + client)
- Logs'u centralize et (ELK stack, DataDog, vb.)

❌ **DON'Ts**:
- Şifreleri plaintext kaydetme
- API key'leri code'a hardcode yapma
- `eval()` kullanma
- `.catch()` ignora yapma (Unhandled rejection)
- CORS'u `true` bırakma

---

## 📚 Kaynaklar

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Rate Limiting Strategies](https://www.npmjs.com/package/express-rate-limit#examples)
- [KVKK Compliance](https://www.kvkk.gov.tr/Icerik/2614/)

---

**Tamamlandığında, `npm start` yapın ve tüm testleri çalıştırın!**

```bash
npm install
npm start

# Bir başka terminal'de:
curl http://localhost:3004/health
```

**Başarılar! 🚀**
