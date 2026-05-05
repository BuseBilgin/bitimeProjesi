const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  let connection;

  try {
    // Bağlantıyı şifre olmadan kur
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('MySQL bağlantısı başarılı!');

    // Veritabanını oluştur
    await connection.execute('CREATE DATABASE IF NOT EXISTS pill_reminder');
    console.log('pill_reminder veritabanı oluşturuldu!');

    // Bağlantıyı kapat ve yeni veritabanı ile yeniden bağlan
    await connection.end();

    // Yeni bağlantıyı pill_reminder veritabanı ile kur
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    // SQL dosyasını oku ve çalıştır (sadece tablo oluşturma komutları)
    const sql = fs.readFileSync('./db/init.sql', 'utf8');
    // CREATE DATABASE ve USE komutlarını kaldır
    const cleanSql = sql.replace(/CREATE DATABASE IF NOT EXISTS pill_reminder;/, '').replace(/USE pill_reminder;/, '');
    const statements = cleanSql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('Tablolar başarıyla oluşturuldu!');

  } catch (error) {
    console.error('Veritabanı kurulumu hatası:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();