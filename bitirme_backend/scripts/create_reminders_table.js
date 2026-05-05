const pool = require('../src/config/database');

async function main() {
  const createSql = `
CREATE TABLE IF NOT EXISTS pill_reminder_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medication_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT,
  remind_at DATETIME NOT NULL,
  method ENUM('email', 'push', 'both') DEFAULT 'email',
  sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES pill_reminder_users(id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES pill_reminder_medications(id) ON DELETE SET NULL
);
`;
  await pool.execute(createSql);
  console.log('pill_reminder_reminders table ensured.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
