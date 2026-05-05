const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  res.on('data', (chunk) => {
    console.log('body', chunk.toString());
  });
});

req.on('error', (e) => {
  console.error('err', e.message);
});

req.end();
