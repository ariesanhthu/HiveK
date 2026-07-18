import { z } from 'zod';
import { GrantDtoSchema, GrantDto } from './package.dto';
import { SortOrder } from './pagination.dto';

const PlanItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  startDate: z.date(),
  expiresAt: z.date(),
  billId: z.string(),
  autoRenew: z.boolean(),
  price: z.number().optional(),
  priceAfterDiscount: z.number().optional(),
});

const AddonItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  purchasedAt: z.date(),
  expiresAt: z.date().nullable(),
  billId: z.string(),
  price: z.number().optional(),
  priceAfterDiscount: z.number().optional(),
});

export type PlanItemDTO = z.infer<typeof PlanItemSchema>;
export type AddonItemDTO = z.infer<typeof AddonItemSchema>;

export class SubscriptionFilterDto {
  userId?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  sort?: SortOrder;
}

export class SubscriptionResponseDto {
  id: string;
  userId: string;
  status: string;
  planItem: PlanItemDTO | null;
  addonItems: AddonItemDTO[];
  computedGrants: GrantDto[];
  computedPermissions: string[];
  nextExpiryCheckAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
