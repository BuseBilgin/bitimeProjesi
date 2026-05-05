const http = require('http');

console.log('🔍 Basit health check testi...');

const req = http.request({
  hostname: 'localhost',
  port: 3002,
  path: '/health',
  method: 'GET'
}, (res) => {
  console.log('✅ Status:', res.statusCode);
  res.on('data', (chunk) => {
    console.log('📄 Response:', chunk.toString());
  });
});

req.on('error', (e) => {
  console.error('❌ Bağlantı hatası:', e.message);
});

req.end();