import { EMAIL_REGEX, PHONE_REGEX, URL_REGEX } from './constants';
import { detectProfanityIndices } from './profanity';
import { SanitizeOptions, SanitizeResult } from './types';

/**
 * Sanitizes the input text by:
 * - Removing/replacing bad words (via @vnphu/vn-badwords + glin-profanity)
 * - Removing/replacing links (URLs)
 * - Optionally removing/replacing emails & phone numbers
 *
 * Returns the clean text plus a breakdown of flagged content.
 *
 * @example
 * ```ts
 * sanitize('Check https://spam.com and f*ck this')
 * // => { sanitizedText: 'Check *** and *** this', flaggedPercent: 24, ... }
 *
 * sanitize('Buy now! Email me@bad.com', { removeContactInfo: true, replaceChar: '#' })
 * // => { sanitizedText: 'Buy now! Email ############', flaggedPercent: 40, ... }
 * ```
 */
export function sanitize(input: string, options?: SanitizeOptions): SanitizeResult {
  const replaceChar = options?.replaceChar ?? '*';
  const removeLinks = options?.removeLinks !== false;
  const removeBadWords = options?.removeBadWords !== false;
  const removeContactInfo = options?.removeContactInfo ?? false;

  // ── Step 1: Find all flagged character indices ────────────────
  const totalLen = input.length;
  const flagged = new Set<number>();
  const breakdown = { profanity: 0, links: 0, contactInfo: 0 };

  if (removeLinks) {
    for (const match of input.matchAll(URL_REGEX)) {
      const m = match[0];
      const start = match.index!;
      for (let i = start; i < start + m.length; i++) {
        flagged.add(i);
      }
      breakdown.links += m.length;
    }
  }

  if (removeContactInfo) {
    for (const regex of [EMAIL_REGEX, PHONE_REGEX]) {
      for (const match of input.matchAll(regex)) {
        const m = match[0];
        const start = match.index!;
        for (let i = start; i < start + m.length; i++) {
          flagged.add(i);
        }
        breakdown.contactInfo += m.length;
      }
    }
  }

  if (removeBadWords) {
    const profanityIndices = detectProfanityIndices(input, flagged);
    for (const idx of profanityIndices) {
      flagged.add(idx);
    }
    breakdown.profanity = profanityIndices.size;
  }

  // ── Step 2: Build sanitized output ────────────────────────────
  let sanitizedText = '';
  for (let i = 0; i < totalLen; i++) {
    sanitizedText += flagged.has(i) ? replaceChar : input[i];
  }

  // ── Step 3: Calculate stats ──────────────────────────────────
  const flaggedCharCount = flagged.size;
  const flaggedPercent = totalLen > 0 ? Math.round((flaggedCharCount / totalLen) * 100) : 0;

  return {
    sanitizedText,
    flaggedPercent,
    flaggedCharCount,
    breakdown,
  };
}
