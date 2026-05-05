const pool = require('./src/config/database');

async function createPillReminderTables() {
  try {
    console.log('🔧 Pill Reminder tabloları oluşturuluyor...');

    // Users table
    await pool.execute(`CREATE TABLE IF NOT EXISTS pill_reminder_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      allergies JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ pill_reminder_users tablosu oluşturuldu');

    // Medications table
    await pool.execute(`CREATE TABLE IF NOT EXISTS pill_reminder_medications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      active_ingredient VARCHAR(255) NOT NULL,
      dosage VARCHAR(100),
      frequency VARCHAR(100),
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES pill_reminder_users(id) ON DELETE CASCADE
    )`);

    console.log('✅ pill_reminder_medications tablosu oluşturuldu');

    // Interactions table
    await pool.execute(`CREATE TABLE IF NOT EXISTS pill_reminder_interactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medication1_id INT NOT NULL,
      medication2_id INT NOT NULL,
      description TEXT,
      severity ENUM('low', 'moderate', 'high'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medication1_id) REFERENCES pill_reminder_medications(id) ON DELETE CASCADE,
      FOREIGN KEY (medication2_id) REFERENCES pill_reminder_medications(id) ON DELETE CASCADE
    )`);

    console.log('✅ pill_reminder_interactions tablosu oluşturuldu');

    console.log('🎉 Tüm tablolar başarıyla oluşturuldu!');

  } catch (error) {
    console.error('❌ Tablo oluşturma hatası:', error.message);
  } finally {
    process.exit(0);
  }
}

createPillReminderTables();