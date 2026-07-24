# bad-words

Content sanitization pipeline — detects profanity, links, and optionally contact info in text, then masks or removes them.

## Usage

```ts
import { sanitize } from '@/shared/utils';

sanitize('Buy now https://spam.com or f\u002a\u002ack');
// => { sanitizedText: 'Buy now *** or ***', flaggedPercent: 22, flaggedCharCount: 8, breakdown: { profanity: 4, links: 16, contactInfo: 0 } }
```

## API

### `sanitize(text, options?)`

| Option              | Default | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| `removeBadWords`    | `true`  | Detect profanity via @vnphu/vn-badwords + glin-profanity |
| `removeLinks`       | `true`  | Strip URLs (http, https, www)                            |
| `removeContactInfo` | `false` | Strip emails & phone numbers                             |
| `replaceChar`       | `'*'`   | Replacement character for masked content                 |

Returns `{ sanitizedText, flaggedPercent, flaggedCharCount, breakdown }`.

Note: `breakdown` counts per-category — overlapping spans (e.g. a bad word inside a URL) are counted in both categories, so `breakdown.*` can sum to more than `flaggedCharCount`.

## Pipeline

```
Input text
  ↓
Links detected (regex)     ← optionally excluded
  ↓
Contact info detected      ← optionally excluded
  ↓
@vnphu/vn-badwords         ← Vietnamese profanity (sentinel masking)
  ↓
glin-profanity             ← global + leetspeak
  ↓
Merge spans → build masked output → calculate stats
```

## Dependencies

- `@vnphu/vn-badwords` — Vietnamese bad-word list
- `glin-profanity` — global profanity detection with leetspeak & unicode normalization
