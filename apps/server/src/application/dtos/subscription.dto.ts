import { z } from 'zod';
import { GrantDtoSchema, GrantDto } from './package.dto';

const PlanItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  startDate: z.date(),
  expiresAt: z.date(),
  billId: z.string(),
  autoRenew: z.boolean(),
});

const AddonItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  purchasedAt: z.date(),
  expiresAt: z.date().nullable(),
  billId: z.string(),
});

export type PlanItemDTO = z.infer<typeof PlanItemSchema>;
export type AddonItemDTO = z.infer<typeof AddonItemSchema>;

export class SubscriptionResponseDto {
  id: string;
  enterpriseId: string;
  status: string;
  planItem: PlanItemDTO | null;
  addonItems: AddonItemDTO[];
  computedGrants: GrantDto[];
  computedPermissions: string[];
  nextExpiryCheckAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
