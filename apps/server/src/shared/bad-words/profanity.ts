import { badWords as vnBadWords } from '@vnphu/vn-badwords';
import { checkProfanity } from 'glin-profanity';

const SENTINEL = '\x00';

/**
 * Runs profanity detection on the original text using both libraries:
 * - @vnphu/vn-badwords (Vietnamese)
 * - glin-profanity (global + leetspeak)
 *
 * Returns a sorted array of character indices in the **original** text that
 * were flagged as profanity, excluding indices already in `excludeSet`.
 */
export function detectProfanityIndices(
  text: string,
  excludeSet: ReadonlySet<number>,
): Set<number> {
  const flagged = new Set<number>();

  if (!text) return flagged;

  // ── Layer 1: @vnphu/vn-badwords ──────────────────────────────
  // Replace bad words with a sentinel char, then find sentinel positions.
  try {
    const masked = vnBadWords(text, {
      replacement: SENTINEL,
      validate: false,
    }) as string;
    for (let i = 0; i < masked.length; i++) {
      if (masked[i] === SENTINEL && !excludeSet.has(i)) {
        flagged.add(i);
      }
    }
  } catch {
    // silently skip on error
  }

  // ── Layer 2: glin-profanity ─────────────────────────────────
  // Provides additional coverage for global profanity + leetspeak
  try {
    const result = checkProfanity(text, {
      detectLeetspeak: true,
    });
    if (result?.filteredWords?.length) {
      for (const word of result.filteredWords) {
        if (!word) continue;
        const lowerWord = word.toLowerCase();
        let idx = text.toLowerCase().indexOf(lowerWord);
        while (idx !== -1) {
          for (let i = idx; i < idx + word.length; i++) {
            if (!excludeSet.has(i)) {
              flagged.add(i);
            }
          }
          idx = text.toLowerCase().indexOf(lowerWord, idx + 1);
        }
      }
    }
  } catch {
    // silently skip on error
  }

  return flagged;
}
