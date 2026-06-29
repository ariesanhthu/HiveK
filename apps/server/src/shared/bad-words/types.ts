/**
 * Configuration options for the text sanitizer.
 */
export interface SanitizeOptions {
  /** Whether to detect and mask bad words. Defaults to `true`. */
  removeBadWords?: boolean;
  /** Whether to detect and mask URLs. Defaults to `true`. */
  removeLinks?: boolean;
  /** Whether to detect and mask emails & phone numbers. Defaults to `false`. */
  removeContactInfo?: boolean;
  /** Character used to mask flagged content. Defaults to `'*'`. */
  replaceChar?: string;
}

/**
 * The result of a sanitize() call.
 *
 * @property flaggedPercent - Integer 0–100 (e.g. 24 means 24 % of characters were flagged).
 * @property breakdown - Per-category counts of flagged characters.
 *   **Note:** Categories may overlap (e.g. a profane word inside a URL).
 *   Each category counts *all* characters it detected; `flaggedCharCount` is
 *   the union (unique) count. Therefore `breakdown.*` values can sum to more
 *   than `flaggedCharCount`.
 */
export interface SanitizeResult {
  /** Cleaned text after all sanitization rules have been applied. */
  sanitizedText: string;
  /** Percentage (0–100) of original characters that were flagged (integer). */
  flaggedPercent: number;
  /** Total number of unique flagged characters. */
  flaggedCharCount: number;
  /** Breakdown of flagged characters by category. */
  breakdown: {
    profanity: number;
    links: number;
    contactInfo: number;
  };
}

/**
 * Internal: represents a range of flagged characters in the original text.
 */
export interface FlaggedSpan {
  start: number;
  end: number; // exclusive
  category: keyof SanitizeResult['breakdown'];
}
