const pool = require('../config/database');

function shouldUseFallback(error) {
  return (
    error?.code === 'ER_ACCESS_DENIED_ERROR' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'PROTOCOL_CONNECTION_LOST'
  );
}

class Reminder {
  static async create(reminderData) {
    const { user_id, medication_id = null, title, note = null, remind_at, method = 'email' } = reminderData;
    const [result] = await pool.execute(
      `INSERT INTO pill_reminder_reminders (user_id, medication_id, title, note, remind_at, method) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, medication_id, title, note, remind_at, method]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM pill_reminder_reminders WHERE user_id = ? ORDER BY remind_at ASC',
      [userId]
    );
    return rows;
  }

  static async update(id, reminderData) {
    const { title, note, remind_at, method } = reminderData;
    await pool.execute(
      `UPDATE pill_reminder_reminders SET title = ?, note = ?, remind_at = ?, method = ? WHERE id = ?`,
      [title, note, remind_at, method, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM pill_reminder_reminders WHERE id = ?', [id]);
  }

  static async findDueReminders(cutoffDateTime) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pill_reminder_reminders WHERE remind_at <= ? AND sent_at IS NULL',
        [cutoffDateTime]
      );
      return rows;
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      return [];
    }
  }

  static async markSent(id) {
    await pool.execute(
      'UPDATE pill_reminder_reminders SET sent_at = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = Reminder;
