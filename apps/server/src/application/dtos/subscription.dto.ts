import { z } from 'zod';
import { PackageQuotaDto } from './package.dto';

const SubscriptionItemSchema = z.object({
  packageId: z.string(),
  packageVariantId: z.string(),
  startDate: z.date(),
  expiresAt: z.date(),
});

export type SubscriptionItemDTO = z.infer<typeof SubscriptionItemSchema>;

const subscriptionResponseSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  status: z.string(),
  items: z.array(SubscriptionItemSchema),
  computedQuotas: PackageQuotaDto,
  computedPermissions: z.array(z.string()),
  nextExpiryCheckAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SubscriptionResponseDTO = z.infer<typeof subscriptionResponseSchema>;
export class SubscriptionResponseDto {
  id: string;
  enterpriseId: string;
  status: string;
  items: SubscriptionItemDTO[];
  computedQuotas: Record<string, number>;
  computedPermissions: string[];
  nextExpiryCheckAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
