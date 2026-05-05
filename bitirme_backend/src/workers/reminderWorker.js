const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Medication = require('../models/Medication');
const notificationService = require('../services/notificationService');

const POLL_INTERVAL_MS = 60 * 1000; // 1 dakika

async function runReminderLoop() {
  console.log('[ReminderWorker] Başlatıldı. Her dakika hatırlatmaları kontrol edecek.');

  async function checkReminders() {
    try {
      const now = new Date();
      const cutoff = now.toISOString().slice(0, 19).replace('T', ' ');
      const reminders = await Reminder.findDueReminders(cutoff);

      for (const reminder of reminders) {
        const user = await User.findById(reminder.user_id);
        const medication = reminder.medication_id ? await Medication.findById(reminder.medication_id) : null;
        const title = reminder.title;
        const message = `${reminder.note || ''}${medication ? `\nMedication: ${medication.name}` : ''}`;

        if (reminder.method === 'email' || reminder.method === 'both') {
          await notificationService.sendEmail(user.email, `Reminder: ${title}`, message);
        }
        if (reminder.method === 'push' || reminder.method === 'both') {
          await notificationService.sendPush(user.id, title, message);
        }

        await Reminder.markSent(reminder.id);
      }
    } catch (error) {
      console.error('[ReminderWorker] Hata:', error);
    }
  }

  setInterval(checkReminders, POLL_INTERVAL_MS);
  // İlk kontrol hemen
  checkReminders();
}

module.exports = { runReminderLoop };
