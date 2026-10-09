import sanitizeHtml from 'sanitize-html';

// Product descriptions may contain simple formatting written by admins.
export const sanitizeRichText = (html) =>
  sanitizeHtml(html ?? '', {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4'],
    allowedAttributes: {},
  });

export const stripTags = (text) =>
  sanitizeHtml(text ?? '', { allowedTags: [], allowedAttributes: {} }).trim();
