const axios = require('axios');

async function testOpenFDA() {
  try {
    console.log('🔍 OpenFDA API test başlanıyor...\n');

    // Test 1: Aspirin sorgulaması - Doğru endpoint
    console.log('Test 1: "Aspirin" aranıyor...');
    const response1 = await axios.get('https://api.fda.gov/drug/label.json', {
      params: {
        search: 'openfda.brand_name:"aspirin"',
        limit: 1
      },
      timeout: 10000
    });

    if (response1.data.results && response1.data.results.length > 0) {
      const drug = response1.data.results[0];
      console.log('✅ Aspirin bulundu!');
      console.log('   İlaç Adı:', drug.openfda?.brand_name?.[0] || 'N/A');
      console.log('   Genel Adı:', drug.openfda?.generic_name?.[0] || 'N/A');
      console.log('   Etken Madde:', drug.active_ingredient?.[0] || 'N/A');
    }

    console.log('\nTest 2: "Ibuprofen" aranıyor...');
    const response2 = await axios.get('https://api.fda.gov/drug/label.json', {
      params: {
        search: 'openfda.generic_name:"ibuprofen"',
        limit: 1
      },
      timeout: 10000
    });

    if (response2.data.results && response2.data.results.length > 0) {
      const drug = response2.data.results[0];
      console.log('✅ Ibuprofen bulundu!');
      console.log('   İlaç Adı:', drug.openfda?.brand_name?.[0] || 'N/A');
      console.log('   Genel Adı:', drug.openfda?.generic_name?.[0] || 'N/A');
      console.log('   Etken Madde:', drug.active_ingredient?.[0] || 'N/A');
    }

    console.log('\n✅ OpenFDA API başarıyla çalışıyor!');
  } catch (error) {
    console.log('❌ OpenFDA API Hatası:', error.message);
    console.log('Sebep:', error.response?.status || 'Bilinmiyor');
  }
}

testOpenFDA();
