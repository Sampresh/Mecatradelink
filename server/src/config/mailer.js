import nodemailer from 'nodemailer';
import { env } from './env.js';

// Without SMTP config (local dev) emails are serialised and logged instead of sent.
export const mailerEnabled = Boolean(env.SMTP_HOST);

export const transporter = mailerEnabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : nodemailer.createTransport({ jsonTransport: true });
