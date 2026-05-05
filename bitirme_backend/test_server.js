const axios = require('axios');

async function testServer() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('Server response:', response.data);
    console.log('✅ Server is running successfully!');
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
  }
}

testServer();