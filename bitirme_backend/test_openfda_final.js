const axios = require('axios');

const API_URL = 'http://localhost:3004/api';

async function testOpenFDAIntegration() {
  try {
    console.log('🔬 OpenFDA Entegrasyon Test (Yeni Kullanıcı)\n');
    console.log('='.repeat(60) + '\n');

    // 1. Yeni kullanıcı oluştur
    console.log('📝 Adım 1: Yeni kullanıcı oluşturma...');
    const uniqueEmail = `testuser${Date.now()}@test.com`;
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email: uniqueEmail,
      password: 'Test123!',
      name: 'Test User'
    });

    console.log('✅ Kullanıcı oluşturuldu\n');

    // 2. Giriş yap
    console.log('📝 Adım 2: Giriş yapılıyor...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'Test123!'
    });

    const token = loginRes.data.token;
    console.log('✅ Giriş başarılı\n');

    // 3. İlaç ekleme - Aspirin
    console.log('📝 Adım 3: Aspirin ilaçı ekleniyor (OpenFDA kontrol ile)...');
    console.log('Request Body:', { name: 'Aspirin', dosage: '100 mg', active_ingredient: 'aspirin' });
    
    const med1Res = await axios.post(
      `${API_URL}/medications`,
      {
        name: 'Aspirin',
        dosage: '100 mg',
        frequency: 'once daily',
        active_ingredient: 'aspirin'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Aspirin eklendi');
    console.log('   Active Ingredient DB\'de:', med1Res.data.medicationId);
    console.log('   Alerts:', med1Res.data.alerts?.length || 0, 'adet\n');

    // 4. İlaç ekleme - Warfarin (bilinenden etkileşim var)
    console.log('📝 Adım 4: Warfarin ilaçı ekleniyor (Aspirin ile etkileşim kontrol)...');
    const med2Res = await axios.post(
      `${API_URL}/medications`,
      {
        name: 'Warfarin',
        dosage: '5 mg',
        frequency: 'once daily',
        active_ingredient: 'warfarin'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Warfarin eklendi');
    if (med2Res.data.alerts && med2Res.data.alerts.length > 0) {
      console.log('   ⚠️  UYARILAR BULUNDU!');
      med2Res.data.alerts.forEach((alert, idx) => {
        console.log(`     ${idx + 1}. ${alert.type.toUpperCase()} - ${alert.description}`);
        console.log(`        Şiddet: ${alert.severity}`);
        if (alert.source) console.log(`        Kaynak: ${alert.source}`);
      });
    } else {
      console.log('   ℹ️  Uyarı yok');
    }
    console.log();

    // 5. Tüm ilaçları listele
    console.log('📝 Adım 5: Kullanıcının tüm ilaçları getiriliyor...');
    const medsRes = await axios.get(
      `${API_URL}/medications`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`✅ ${medsRes.data.length} ilaç bulundu:`);
    medsRes.data.forEach((med, idx) => {
      console.log(`   ${idx + 1}. ${med.name}`);
      console.log(`      - Etken Madde: ${med.active_ingredient}`);
      console.log(`      - Doz: ${med.dosage}`);
      console.log(`      - Sıklık: ${med.frequency}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ OpenFDA Entegrasyonu BAŞARILI!');

  } catch (error) {
    console.log('\n❌ Hata:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testOpenFDAIntegration();
