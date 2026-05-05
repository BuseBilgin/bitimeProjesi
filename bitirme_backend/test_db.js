const pool = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('🔍 Veritabanı bağlantısı test ediliyor...');
    const connection = await pool.getConnection();
    console.log('✅ Veritabanı bağlantısı başarılı!');

    // Test query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📊 Tablolar:', rows.map(row => Object.values(row)[0]));

    connection.release();
    console.log('✅ Veritabanı testi tamamlandı!');
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase();