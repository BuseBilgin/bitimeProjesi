const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'db', 'init.sql');
const sql = `
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medication_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT,
  remind_at DATETIME NOT NULL,
  method ENUM('email', 'push', 'both') DEFAULT 'email',
  sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
);
`;

fs.appendFileSync(filePath, sql);
console.log('Reminders table appended to init.sql');
