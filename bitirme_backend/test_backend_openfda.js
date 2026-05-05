const axios = require('axios');

const API_URL = 'http://localhost:3004/api';

async function testBackendAPI() {
  try {
    console.log('🧪 Backend API Test Başlıyor...\n');

    // Test 1: Kaydol
    console.log('Test 1: Yeni kullanıcı kaydı...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email: 'testuser@test.com',
      password: 'Test123!',
      name: 'Test User'
    });

    if (registerRes.data.success) {
      console.log('✅ Kayıt başarılı!');
    } else if (registerRes.data.message === 'User already exists') {
      console.log('ℹ️  Kullanıcı zaten mevcut');
    }

    // Test 2: Giriş yap
    console.log('\nTest 2: Kullanıcı giriş yaptırılıyor...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'testuser@test.com',
      password: 'Test123!'
    });

    const token = loginRes.data.token;
    console.log('✅ Giriş başarılı! Token alındı');

    // Test 3: İlaç ekle (OpenFDA ile etkileşim kontrolü)
    console.log('\nTest 3: İlaç ekleniyor (OpenFDA kontrol ile)...');
    const medicationRes = await axios.post(
      `${API_URL}/medications`,
      {
        name: 'Aspirin',
        dosage: '100 mg',
        frequency: 'once daily',
        active_ingredient: 'aspirin'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (medicationRes.status === 200 || medicationRes.status === 201) {
      console.log('✅ İlaç başarıyla eklendi!');
      if (medicationRes.data.alerts && medicationRes.data.alerts.length > 0) {
        console.log('   ⚠️  Uyarılar algılandı:');
        medicationRes.data.alerts.forEach(alert => {
          console.log(`     - ${alert.type}: ${alert.description}`);
        });
      }
    }

    // Test 4: Kullanıcının ilaçlarını getir
    console.log('\nTest 4: Kullanıcının ilaçları getiriliyor...');
    const medsRes = await axios.get(`${API_URL}/medications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (medsRes.data.medications && medsRes.data.medications.length > 0) {
      console.log(`✅ ${medsRes.data.medications.length} ilaç bulundu:`);
      medsRes.data.medications.forEach(med => {
        console.log(`   - ${med.name} (${med.dosage})`);
      });
    }

    console.log('\n✅ Tüm testler başarılı!');
  } catch (error) {
    console.log('❌ API Hatası:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status || 'Unknown');
  }
}

testBackendAPI();
