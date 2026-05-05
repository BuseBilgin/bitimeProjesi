const pool = require('../config/database');

class Interaction {
  static async create(interactionData) {
    const { medication1_id, medication2_id, description, severity } = interactionData;
    const [result] = await pool.execute(
      'INSERT INTO pill_reminder_interactions (medication1_id, medication2_id, description, severity) VALUES (?, ?, ?, ?)',
      [medication1_id, medication2_id, description, severity]
    );
    return result.insertId;
  }

  static async findByMedications(med1Id, med2Id) {
    const [rows] = await pool.execute(
      'SELECT * FROM pill_reminder_interactions WHERE (medication1_id = ? AND medication2_id = ?) OR (medication1_id = ? AND medication2_id = ?)',
      [med1Id, med2Id, med2Id, med1Id]
    );
    return rows;
  }
}

module.exports = Interaction;