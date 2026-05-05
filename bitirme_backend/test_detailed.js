const axios = require('axios');

const API_URL = 'http://localhost:3004/api';

async function testDetailedOpenFDA() {
  try {
    console.log('🔬 Detaylı OpenFDA Entegrasyon Test\n');
    console.log('='.repeat(50) + '\n');

    // Giriş yap
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'testuser@test.com',
      password: 'Test123!'
    });

    const token = loginRes.data.token;
    console.log('✅ Giriş başarılı\n');

    // İlaç ekleme - Aspirin
    console.log('📋 Test 1: Aspirin ekleme (OpenFDA tarafından doğrulanacak)');
    console.log('-'.repeat(50));
    const res1 = await axios.post(
      `${API_URL}/medications`,
      {
        name: 'Aspirin',
        dosage: '100 mg',
        frequency: 'once daily',
        active_ingredient: 'aspirin'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Response Status:', res1.status);
    console.log('Response Data:', JSON.stringify(res1.data, null, 2));

    // İlaç ekleme - Ibuprofen (Aspirin ile etkileşim var)
    console.log('\n📋 Test 2: Ibuprofen ekleme (Aspirin ile beraber)');
    console.log('-'.repeat(50));
    const res2 = await axios.post(
      `${API_URL}/medications`,
      {
        name: 'Ibuprofen',
        dosage: '200 mg',
        frequency: 'twice daily',
        active_ingredient: 'ibuprofen'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Response Status:', res2.status);
    console.log('Response Data:', JSON.stringify(res2.data, null, 2));

    // İlaçları getir
    console.log('\n📋 Test 3: Tüm ilaçları listele');
    console.log('-'.repeat(50));
    const medsRes = await axios.get(
      `${API_URL}/medications`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Response Status:', medsRes.status);
    console.log('Response Data:', JSON.stringify(medsRes.data, null, 2));

  } catch (error) {
    console.log('❌ Hata:', error.response?.data || error.message);
  }
}

testDetailedOpenFDA();
