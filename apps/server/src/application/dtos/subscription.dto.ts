import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GrantDtoSchema } from './package.dto';
import { CursorPaginationRequestSchema } from './pagination.dto';

export const PlanItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  startDate: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  billId: z.string(),
  autoRenew: z.boolean(),
  price: z.number().optional(),
  priceAfterDiscount: z.number().optional(),
}).strict();

export class PlanItemDto extends createZodDto(PlanItemSchema) {}
export type PlanItemDTO = PlanItemDto;

export const AddonItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  purchasedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  billId: z.string(),
  price: z.number().optional(),
  priceAfterDiscount: z.number().optional(),
}).strict();

export class AddonItemDto extends createZodDto(AddonItemSchema) {}
export type AddonItemDTO = AddonItemDto;

export const SubscriptionFilterDtoSchema = CursorPaginationRequestSchema.extend({
  userId: z.string().optional(),
  status: z.string().optional(),
});

export class SubscriptionFilterDto extends createZodDto(SubscriptionFilterDtoSchema) {}

export const SubscriptionResponseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.string(),
  planItem: PlanItemSchema.nullable(),
  addonItems: z.array(AddonItemSchema),
  computedGrants: z.array(GrantDtoSchema),
  computedPermissions: z.array(z.string()),
  nextExpiryCheckAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export class SubscriptionResponseDto extends createZodDto(SubscriptionResponseDtoSchema) {}

