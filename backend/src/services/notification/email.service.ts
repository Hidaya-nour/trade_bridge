import nodemailer from 'nodemailer';
import logger from '../../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"TradeBridge" <${process.env.SMTP_FROM || 'noreply@tradebridge.com'}>`,
        to,
        subject,
        html
      });
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to TradeBridge!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for registering on TradeBridge. Your account is pending approval.</p>
      <p>You will receive another email once your account is verified.</p>
      <br>
      <p>Best regards,</p>
      <p>The TradeBridge Team</p>
    `;
    await this.sendEmail(to, 'Welcome to TradeBridge', html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await this.sendEmail(to, 'Password Reset Request', html);
  }

  async sendAccountApprovedEmail(to: string, name: string): Promise<void> {
    const html = `
      <h1>Account Approved!</h1>
      <p>Dear ${name},</p>
      <p>Your TradeBridge account has been approved. You can now log in and start using the platform.</p>
      <a href="${process.env.FRONTEND_URL}/login">Login to TradeBridge</a>
    `;
    await this.sendEmail(to, 'Account Approved', html);
  }
}