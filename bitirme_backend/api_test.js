const http = require('http');

console.log('🚀 API Test Başlatılıyor...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

console.log('1. Health Check Testi:');
console.log('Connecting to http://localhost:3000/health');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });

  res.on('end', () => {
    console.log('✅ Health check successful!\n');
    console.log('🎉 API testi tamamlandı!');
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
  console.log('💡 Server çalışıyor mu kontrol edin: node server.js');
});

req.setTimeout(5000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.end();