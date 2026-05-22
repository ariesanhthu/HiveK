import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AudienceDtoSchema = z.object({
  ageRange: z.string(),
  interests: z.array(z.string()),
});

export const TargetingDtoSchema = z.object({
  audience: AudienceDtoSchema,
  locations: z.array(z.string()),
});

export const ProductDtoSchema = z.object({
  name: z.string(),
  category: z.string(),
  brand: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  keywords: z.array(z.string()),
  priceSegment: z.enum(['low', 'mid', 'high']),
});

export const MarketingDtoSchema = z.object({
  angle: z.array(z.string()),
  contentStyle: z.array(z.string()),
  tone: z.array(z.string()),
  keyMessages: z.array(z.string()),
});

export const PricingDtoSchema = z.object({
  originalPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  currency: z.string().default('VND'),
});

export const PromotionDtoSchema = z.object({
  type: z.enum(['discount', 'bundle', 'cashback']),
  value: z.number().nonnegative(),
  unit: z.enum(['percent', 'amount']),
});

export const ChannelDtoSchema = z.object({
  type: z.enum(['ecommerce', 'retail', 'social']),
  platform: z.string(),
  url: z.string(),
});

export const CampaignItemDtoSchema = z.object({
  product: ProductDtoSchema,
  marketing: MarketingDtoSchema,
  pricing: PricingDtoSchema,
  promotion: PromotionDtoSchema,
  channels: z.array(ChannelDtoSchema),
});

export const RawItemDtoSchema = z.object({
  fileId: z.string(),
  rawText: z.string(),
  inference: z.string().default(''),
});

export const CampaignDtoSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  enterpriseId: z.string(),
  campaign: z.object({
    name: z.string(),
    type: z.enum(['promotion', 'launch', 'seasonal']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    objective: z.string(),
    description: z.string(),
  }),
  targeting: TargetingDtoSchema,
  campaignItems: z.array(CampaignItemDtoSchema),
  raw: z.array(RawItemDtoSchema),
});

export class CampaignDto extends createZodDto(CampaignDtoSchema) {}

export const CreateCampaignInputDtoSchema = CampaignDtoSchema.omit({ id: true });
export class CreateCampaignInputDto extends createZodDto(CreateCampaignInputDtoSchema) {}

export const UpdateCampaignInputDtoSchema = CampaignDtoSchema.omit({ id: true }).partial();
export class UpdateCampaignInputDto extends createZodDto(UpdateCampaignInputDtoSchema) {}
