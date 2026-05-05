const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Configure mail transport if SMTP settings are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmail(to, subject, text) {
    if (!this.transporter) {
      console.log('[NotificationService] SMTP not configured, skipping email send:', { to, subject, text });
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
  }

  async sendPush(userId, title, message) {
    // Placeholder: In a real app, integrate with FCM/APNs etc.
    console.log(`[NotificationService] Sending push to user ${userId}: ${title} - ${message}`);
  }
}

module.exports = new NotificationService();
