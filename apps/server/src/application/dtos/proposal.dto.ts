import { EMediaSlideType, EProductPlatform, EProposalStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CursorPaginationRequestSchema } from './pagination.dto';

export const MediaSlideDtoSchema = z
  .object({
    type: z.enum(EMediaSlideType),
    fileId: z.string(),
    displayOrder: z.number().int().nonnegative(),
  })
  .strict();

export const ProductItemDtoSchema = z
  .object({
    productId: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
    currency: z.string(),
    imageId: z.string(),
    affiliateUrls: z.record(z.string(), z.string()),
  })
  .strict();

export const VoucherItemDtoSchema = z
  .object({
    code: z.string(),
    platform: z.enum(EProductPlatform),
    discountValue: z.string(),
    description: z.string(),
    expirationDate: z.any(),
  })
  .strict();

export const ProposalDtoSchema = z
  .object({
    id: z.string(),
    campaignId: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    mediaSlides: z.array(MediaSlideDtoSchema).default([]),
    products: z.array(ProductItemDtoSchema).default([]),
    vouchers: z.array(VoucherItemDtoSchema).default([]),
    status: z.enum(EProposalStatus),
    metrics: z.record(z.string(), z.number()).default({}),
    createdAt: z.any(),
    updatedAt: z.any(),
  })
  .strict();

export class ProposalDto extends createZodDto(ProposalDtoSchema) {}

export const ProposalFilterSchema = CursorPaginationRequestSchema.extend({
  campaignId: z.string().optional(),
  status: z.string().optional(),
}).strict();

export class ProposalFilterDto extends createZodDto(ProposalFilterSchema) {}
