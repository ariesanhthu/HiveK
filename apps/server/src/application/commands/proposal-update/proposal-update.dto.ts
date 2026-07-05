import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EMediaSlideType, EProductPlatform } from '@/core/enums';

export const ProposalUpdateProductInputSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(200),
  price: z.number().nonnegative(),
  currency: z.string().min(1).max(10),
  imageId: z.string().min(1),
  affiliateUrls: z.record(z.string(), z.string()).optional().default({}),
}).strict();

export const ProposalUpdateVoucherInputSchema = z.object({
  code: z.string().min(1),
  platform: z.enum(EProductPlatform),
  discountValue: z.string().min(1),
  description: z.string().min(1).max(500),
  expirationDate: z.any(),
}).strict();

export const ProposalUpdateMediaSlideInputSchema = z.object({
  type: z.enum(EMediaSlideType),
  fileId: z.string().min(1),
  displayOrder: z.number().int().nonnegative(),
}).strict();

export const ProposalUpdateInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  mediaSlides: z.array(ProposalUpdateMediaSlideInputSchema).optional(),
  products: z.array(ProposalUpdateProductInputSchema).optional(),
  vouchers: z.array(ProposalUpdateVoucherInputSchema).optional(),
}).strict();

export class ProposalUpdateInputDto extends createZodDto(ProposalUpdateInputSchema) {}
