import { transporter, mailerEnabled } from '../config/mailer.js';
import { env } from '../config/env.js';
import { business } from '../config/business.js';
import { logger } from '../utils/logger.js';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const layout = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
    <div style="background:#0b0b0f;padding:16px 24px;border-radius:8px 8px 0 0">
      <img src="${esc(env.CLIENT_URL)}/images/brand/logo-96.png" width="44" height="44" alt="Meca Trade Link" style="vertical-align:middle;border:0">
      <span style="color:#ffffff;font-weight:700;font-size:18px;vertical-align:middle;margin-left:10px">Meca Trade Link</span>
    </div>
    <div style="border:1px solid #eee;border-top:0;padding:24px;border-radius:0 0 8px 8px">
      <h2 style="margin-top:0">${esc(title)}</h2>
      ${body}
    </div>
    <p style="color:#888;font-size:12px;text-align:center">
      Electrical products &amp; materials supplier · ${esc(business.location)}<br>
      Call / WhatsApp ${esc(business.phone)} · ${esc(business.email)}
    </p>
  </div>`;

const button = (href, label) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#f59e0b;color:#111;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">${esc(label)}</a></p>`;

async function send({ to, subject, html, replyTo }) {
  try {
    const info = await transporter.sendMail({ from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`, to, subject, html, replyTo });
    if (!mailerEnabled) logger.info(`[email:dev] to=${to} subject="${subject}"\n${html.match(/href="([^"]+)"/)?.[1] ?? ''}`);
    return info;
  } catch (err) {
    // Email failures must not break the request that triggered them.
    logger.error(`Email to ${to} failed: ${err.message}`);
  }
}

export const sendVerificationEmail = (user, token) =>
  send({
    to: user.email,
    subject: 'Verify your email — Meca Trade Link',
    html: layout(
      `Welcome, ${user.name}`,
      `<p>Please confirm your email address to activate your account.</p>
       ${button(`${env.CLIENT_URL}/verify-email?token=${token}`, 'Verify email')}
       <p style="color:#666;font-size:13px">This link expires in 24 hours.</p>`,
    ),
  });

export const sendPasswordResetEmail = (user, token) =>
  send({
    to: user.email,
    subject: 'Reset your password — Meca Trade Link',
    html: layout(
      'Password reset',
      `<p>We received a request to reset your password.</p>
       ${button(`${env.CLIENT_URL}/reset-password?token=${token}`, 'Reset password')}
       <p style="color:#666;font-size:13px">This link expires in 1 hour. If you did not request it, ignore this email.</p>`,
    ),
  });

const enquiryTable = (enquiry) => {
  const rows = [
    ['Name', enquiry.name], ['Email', enquiry.email], ['Phone', enquiry.phone],
    ['Company', enquiry.company], ['Location', enquiry.location],
  ].filter(([, v]) => v);
  const items = enquiry.items?.length
    ? `<h3>Products</h3><ul>${enquiry.items.map((i) => `<li>${esc(i.productName)} — ${i.quantity} ${esc(i.unit)}</li>`).join('')}</ul>`
    : '';
  return `<table style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${esc(v)}</td></tr>`)
    .join('')}</table>${items}${enquiry.message ? `<h3>Message</h3><p style="white-space:pre-wrap">${esc(enquiry.message)}</p>` : ''}`;
};

export const sendEnquiryNotification = (enquiry) =>
  env.ENQUIRY_NOTIFY_EMAIL &&
  send({
    to: env.ENQUIRY_NOTIFY_EMAIL,
    replyTo: enquiry.email || undefined,
    subject: `New ${enquiry.type === 'QUOTE' ? 'quote request' : 'enquiry'} from ${enquiry.name}`,
    html: layout(
      enquiry.type === 'QUOTE' ? 'New quote request' : 'New enquiry',
      `${enquiryTable(enquiry)}${button(`${env.CLIENT_URL}/admin/enquiries/${enquiry.id}`, 'Open in admin')}`,
    ),
  });

// Only possible when the customer left an email (phone-only enquiries are allowed).
export const sendEnquiryAcknowledgement = (enquiry) =>
  enquiry.email &&
  send({
    to: enquiry.email,
    subject: 'We received your request — Meca Trade Link',
    html: layout(
      `Thank you, ${enquiry.name}`,
      `<p>Our sales team has received your ${enquiry.type === 'QUOTE' ? 'quote request' : 'message'} and will get back to you within one business day.</p>
       <p>Need it sooner? Call or WhatsApp us on <strong>${esc(business.phone)}</strong>.</p>${enquiryTable(enquiry)}`,
    ),
  });
