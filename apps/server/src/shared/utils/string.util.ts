/**
 * Normalizes text in snake_case, kebab-case, PascalCase, or other delimiters to camelCase.
 * E.g.:
 * - "logo_url_id" -> "logoUrlId"
 * - "logo-url-id" -> "logoUrlId"
 * - "LogoUrlId"   -> "logoUrlId"
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[-_]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Builds a storage-safe filename: <name-without-extension>-<uuid>
 */
export function buildFilename(originalname: string): string {
  const name = path.parse(originalname).name;
  return `${name}-${uuidv4()}`;
}
