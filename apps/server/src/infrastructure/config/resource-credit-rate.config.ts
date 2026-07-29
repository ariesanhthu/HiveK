export interface ResourceCreditRate {
  creditType: string;
  creditsPerUnit: number;
}

export const RESOURCE_CREDIT_RATES: Record<string, ResourceCreditRate> = {
  ai_gen_video: { creditType: 'ai_credits', creditsPerUnit: 50 },
  ai_gen_image: { creditType: 'ai_credits', creditsPerUnit: 10 },
  ai_gen_post: { creditType: 'ai_credits', creditsPerUnit: 5 },
};
