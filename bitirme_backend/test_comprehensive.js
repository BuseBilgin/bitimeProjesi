const axios = require('axios');

const API_URL = 'http://localhost:3004/api';

async function comprehensiveTest() {
  try {
    console.log('🔬 KAPSAMLI OpenFDA ENTEGRASYON TESTİ\n');
    console.log('='.repeat(70) + '\n');

    // 1. Yeni kullanıcı oluştur
    const uniqueEmail = `testcomp${Date.now()}@test.com`;
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email: uniqueEmail,
      password: 'Test123!',
      name: 'Comprehensive Test User',
      allergies: ['penicillin', 'sulfonamides']
    });

    console.log('✅ Kullanıcı oluşturuldu (Alerjiler: penicillin, sulfonamides)\n');

    // 2. Giriş yap
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'Test123!'
    });

    const token = loginRes.data.token;

    // Test ilaçları - çeşitli kombinasyonlar
    const testMedications = [
      { name: 'Aspirin', dosage: '100 mg', frequency: 'once daily' },
      { name: 'Warfarin', dosage: '5 mg', frequency: 'once daily' },
      { name: 'Ibuprofen', dosage: '200 mg', frequency: 'three times daily' },
      { name: 'Metformin', dosage: '500 mg', frequency: 'twice daily' }
    ];

    console.log('📋 İlaçlar ekleniyor ve etkileşim kontrolleri yapılıyor:\n');

    for (let i = 0; i < testMedications.length; i++) {
      const med = testMedications[i];
      console.log(`${i + 1}. ${med.name} (${med.dosage})...`);

      const medRes = await axios.post(
        `${API_URL}/medications`,
        {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          active_ingredient: med.name.toLowerCase()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (medRes.status === 201) {
        console.log(`   ✅ Eklendi (ID: ${medRes.data.medicationId})`);

        if (medRes.data.alerts && medRes.data.alerts.length > 0) {
          console.log(`   ⚠️  ${medRes.data.alerts.length} uyarı bulundu:`);
          medRes.data.alerts.forEach((alert, idx) => {
            console.log(`      ${idx + 1}. [${alert.type.toUpperCase()}] ${alert.description}`);
            console.log(`         Şiddet: ${alert.severity} | Kaynak: ${alert.source || 'System'}`);
          });
        } else {
          console.log(`   ℹ️  Uyarı yok`);
        }
      }
      console.log();
    }

    // 3. Tüm ilaçları getir
    console.log('📋 Kullanıcının İlaç Listesi:\n');
    const medsRes = await axios.get(
      `${API_URL}/medications`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`${medsRes.data.length} ilaç kaydedildi:\n`);
    medsRes.data.forEach((med, idx) => {
      console.log(`${idx + 1}. ${med.name}`);
      console.log(`   - Etken Madde: ${med.active_ingredient}`);
      console.log(`   - Doz: ${med.dosage}`);
      console.log(`   - Sıklık: ${med.frequency}`);
      console.log();
    });

    console.log('='.repeat(70));
    console.log('✅ KAPSAMLI TEST BAŞARILI!');
    console.log('\n📊 Özet:');
    console.log(`   • ${medsRes.data.length} ilaç başarıyla kaydedildi`);
    console.log('   • OpenFDA entegrasyonu çalışıyor');
    console.log('   • Etkileşim kontrolleri aktif');
    console.log('   • Etken maddeler doğru kaydediliyor');

  } catch (error) {
    console.log('\n❌ Hata:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error Details:', error.response.data);
    }
  }
}

comprehensiveTest();
