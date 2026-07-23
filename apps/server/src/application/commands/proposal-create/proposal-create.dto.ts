import { EMediaSlideType, EProductPlatform } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProposalProductInputSchema = z
  .object({
    productId: z.string().min(1),
    name: z.string().min(1).max(200),
    price: z.number().nonnegative(),
    currency: z.string().min(1).max(10),
    imageId: z.string().min(1),
    affiliateUrls: z.record(z.string(), z.string()).optional().default({}),
  })
  .strict();

export const ProposalVoucherInputSchema = z
  .object({
    code: z.string().min(1),
    platform: z.enum(EProductPlatform),
    discountValue: z.string().min(1),
    description: z.string().min(1).max(500),
    expirationDate: z.any(),
  })
  .strict();

export const ProposalMediaSlideInputSchema = z
  .object({
    type: z.enum(EMediaSlideType),
    fileId: z.string().min(1),
    displayOrder: z.number().int().nonnegative(),
  })
  .strict();

export const ProposalCreateInputSchema = z
  .object({
    campaignId: z.string().min(1),
    slug: z.string().min(1).max(200),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    mediaSlides: z.array(ProposalMediaSlideInputSchema).optional().default([]),
    products: z.array(ProposalProductInputSchema).optional().default([]),
    vouchers: z.array(ProposalVoucherInputSchema).optional().default([]),
  })
  .strict();

export class ProposalCreateInputDto extends createZodDto(
  ProposalCreateInputSchema,
) {}
