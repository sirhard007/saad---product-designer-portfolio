/**
 * Resolves tricky copy-paste formatting issues:
 * 1. Replaces normal hyphens between words with non-breaking hyphens (&#8209;) to prevent hyphen-snapping.
 * 2. Replaces non-breaking spaces (&nbsp;, \u00A0) with normal spaces to prevent words from being glued together and chopped mid-word.
 */

const normalizeText = (str: string) => {
  return str
    // Fix glued words caused by copy-pasting from Word/PDFs
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\u202F/g, ' ')
    // Protect hyphenated words
    .replace(/(?<=[a-zA-Z])-(?=[a-zA-Z])/g, '\u2011');
};

// Format plain text
export const formatText = (text: string) => {
  if (!text) return text;
  return normalizeText(text);
};

// Format HTML content safely (only replaces text outside of HTML tags)
export const formatHtml = (html: string) => {
  if (!html) return html;
  return html.split(/(<[^>]*>)/g).map(part => {
    // If the part is an HTML tag, leave it alone
    if (part.startsWith('<') && part.endsWith('>')) {
      return part;
    }
    
    // Normalize spaces and format hyphens only in the safe text nodes
    let safePart = part
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\u202F/g, ' ')
      .replace(/(?<=[a-zA-Z])-(?=[a-zA-Z])/g, '&#8209;');
      
    return safePart;
  }).join('');
};
