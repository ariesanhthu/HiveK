/**
 * Matches HTTP/HTTPS URLs and www-prefixed domains.
 */
export const URL_REGEX = /https?:\/\/[^\s'"<>)]+|www\.[^\s'"<>)]+/gi;

/**
 * Matches common email patterns.
 */
export const EMAIL_REGEX = /\S+@\S+\.\S+/gi;

/**
 * Matches Vietnamese phone numbers:
 * - 0xxxxxxxxx (10 digits, starting with 0)
 * - +84xxxxxxxxx (international format)
 */
export const PHONE_REGEX = /(0|\+84)\d{9,10}/gi;
