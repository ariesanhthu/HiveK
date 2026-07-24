import type { PlatformId } from '@/features/campaign-planning/types/campaign-planning';
import type { ContentValidationResult, RiskLevel } from '@/server/ai/types/agent.types';

const AI_LIKE_PHRASES = [
  'kham pha',
  'hanh trinh',
  'tuyet voi',
  'doc dao',
  'dang nho',
];

const SENSITIVE_TERMS = ['cam ket', 'bao dam', 'chua khoi', 'loi nhuan', 'giam can'];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function getRiskLevel(content: string): RiskLevel {
  const normalizedContent = normalizeText(content);
  if (SENSITIVE_TERMS.some((term) => normalizedContent.includes(term))) return 'amber';
  if (content.length > 1200) return 'amber';
  return 'green';
}

export function validateContentHeuristically(
  platform: PlatformId,
  content: string,
): ContentValidationResult {
  const normalizedContent = normalizeText(content);
  const aiLikeHitCount =
    AI_LIKE_PHRASES.filter((phrase) => normalizedContent.includes(phrase)).length;
  const hasHashtags = content.includes('#');
  const riskLevel = getRiskLevel(content);
  const issues: string[] = [];

  if (aiLikeHitCount >= 3) {
    issues.push('Tone may sound too generic for social content.');
  }

  if (platform === 'threads' && content.length > 500) {
    issues.push('Threads content should be shorter and easier to reply to.');
  }

  if (platform !== 'threads' && !hasHashtags) {
    issues.push('Consider adding campaign hashtags for tracking.');
  }

  if (riskLevel !== 'green') {
    issues.push('Sensitive or strong claim detected; keep human review enabled.');
  }

  const brandFitScore = clampScore(0.88 - issues.length * 0.04);
  const humanLikenessScore = clampScore(0.86 - aiLikeHitCount * 0.08);
  const factualConsistencyScore = riskLevel === 'green' ? 0.92 : 0.74;
  const platformFitScore = clampScore(platform === 'threads' && content.length > 500 ? 0.72 : 0.84);
  const salesPressureScore = clampScore(
    normalizedContent.includes('mua ngay') || normalizedContent.includes('dat ngay')
      ? 0.58
      : 0.28,
  );

  return {
    riskLevel,
    brandFitScore,
    humanLikenessScore,
    factualConsistencyScore,
    platformFitScore,
    salesPressureScore,
    issues,
    suggestedRevision: issues.length > 0
      ? 'Shorten the hook, make the CTA softer, and avoid unsupported claims.'
      : 'Content is ready for human review or approval.',
    finalDecision: riskLevel === 'green' && issues.length === 0
      ? 'approve'
      : riskLevel === 'amber'
      ? 'human_review'
      : 'revise',
  };
}
