const Reminder = require('../models/Reminder');

class ReminderController {
  async listReminders(req, res) {
    try {
      const reminders = await Reminder.findByUserId(req.user.id);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createReminder(req, res) {
    try {
      const userId = req.user.id;
      const { medication_id, title, note, remind_at, method } = req.body;

      if (!title || !remind_at) {
        return res.status(400).json({ error: 'title and remind_at are required' });
      }

      const reminderId = await Reminder.create({
        user_id: userId,
        medication_id: medication_id || null,
        title,
        note,
        remind_at,
        method: method || 'email'
      });

      res.status(201).json({ message: 'Reminder created', reminderId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateReminder(req, res) {
    try {
      const { id } = req.params;
      const { title, note, remind_at, method } = req.body;
      await Reminder.update(id, { title, note, remind_at, method });
      res.json({ message: 'Reminder updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteReminder(req, res) {
    try {
      const { id } = req.params;
      await Reminder.delete(id);
      res.json({ message: 'Reminder deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReminderController();
