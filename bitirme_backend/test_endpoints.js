// Test script for API endpoints
const http = require('http');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  allergies: ['penicillin']
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testOpenFDAIntegration() {
  const port = process.env.PORT || 8080;
  console.log(`🧪 OpenFDA Entegrasyon Testi (Port ${port})\n`);

  try {
    // 1. Health Check
    console.log('1. GET /health');
    const health = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/health',
      method: 'GET'
    });
    console.log('✅ Status:', health.status, 'Response:', health.data);
    console.log('');

    // 2. Register
    console.log('2. POST /api/auth/register');
    const register = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/api/auth/register',
      method: 'POST'
    }, testUser);
    console.log('✅ Status:', register.status, 'Response:', register.data);
    console.log('');

    // 3. Login
    console.log('3. POST /api/auth/login');
    const login = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Status:', login.status, 'Response:', login.data);

    if (login.data.token) {
      const token = login.data.token;
      console.log('🔑 JWT Token alındı\n');

      // 4. Add medication with interaction check
      console.log('4. POST /api/medications - Aspirin ekleme');
      const medicationResponse = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/medications',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, {
        name: 'Aspirin',
        active_ingredient: 'acetylsalicylic acid',
        dosage: '100mg',
        frequency: 'daily',
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });

      console.log('✅ Status:', medicationResponse.status);
      console.log('📄 Response:', JSON.stringify(medicationResponse.data, null, 2));
      console.log('');

      // 5. Add second medication to test interactions
      console.log('5. POST /api/medications - Warfarin ekleme (etkileşim testi)');
      const warfarinResponse = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/medications',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, {
        name: 'Warfarin',
        active_ingredient: 'warfarin',
        dosage: '5mg',
        frequency: 'daily',
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });

      console.log('✅ Status:', warfarinResponse.status);
      console.log('📄 Response:', JSON.stringify(warfarinResponse.data, null, 2));
    }

    console.log('\n🎉 OpenFDA entegrasyon testi tamamlandı!');

  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testOpenFDAIntegration();