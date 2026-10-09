import { site, whatsappLink } from './site';

/**
 * Showcase mode (no API): turn an enquiry into a ready-to-send WhatsApp message and email.
 * `lines` are the requested products: [{ name, model, quantity, unit }].
 */
export function buildEnquiry({ kind, name, phone, email, company, location, message, lines = [] }) {
  const text = [
    `Hello ${site.name}, I'd like ${kind === 'quote' ? 'a price quotation' : 'some help'}.`,
    lines.length && '',
    ...lines.map((l) => `• ${l.name}${l.model ? ` (${l.model})` : ''}: ${l.quantity} ${l.unit ?? 'piece'}${l.quantity > 1 ? 's' : ''}`),
    message && '',
    message,
    '',
    `Name: ${name}`,
    phone && `Phone: ${phone}`,
    email && `Email: ${email}`,
    company && `Company: ${company}`,
    location && `Location: ${location}`,
  ].filter((x) => x !== false && x != null && x !== undefined).join('\n');

  const subject = kind === 'quote' ? `Quotation request from ${name}` : `Enquiry from ${name}`;
  return {
    message: 'Your enquiry is ready.',
    whatsapp: whatsappLink(text),
    mailto: `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
  };
}
