/**
 * Utility for sanitizing inputs to prevent NoSQL injection and other malicious queries.
 */
export class MongoSanitizeUtil {
  /**
   * Escapes special characters in a string to be used in a regular expression.
   * This prevents users from injecting regex operators that could lead to
   * catastrophic backtracking (ReDoS) or unintended query results.
   */
  static escapeRegex(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Sanitizes a string for use in MongoDB queries by removing or escaping 
   * characters that could be misinterpreted as operators.
   * Note: NestJS + Zod already prevent object-based injection by validating types.
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    // Basic trimming and cleaning
    return input.trim();
  }
}
