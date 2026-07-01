import { z } from 'zod';
import { PackageQuotaDto } from './package.dto';

const SubscriptionChangeDetailsSchema = z.object({
  oldPackages: z.array(z.string()),
  newPackages: z.array(z.string()),
  oldQuotas: PackageQuotaDto,
  newQuotas: PackageQuotaDto,
  oldPermissions: z.array(z.string()),
  newPermissions: z.array(z.string()),
});

export type SubscriptionChangeDetailsDTO = z.infer<typeof SubscriptionChangeDetailsSchema>;

const subscriptionHistoryResponseSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  enterpriseId: z.string(),
  billId: z.string().nullable(),
  actorId: z.string().nullable(),
  details: SubscriptionChangeDetailsSchema,
  createdAt: z.date(),
});

export type SubscriptionHistoryResponseDTO = z.infer<typeof subscriptionHistoryResponseSchema>;
export class SubscriptionHistoryResponseDto {
  id: string;
  subscriptionId: string;
  enterpriseId: string;
  billId: string | null;
  actorId: string | null;
  details: SubscriptionChangeDetailsDTO;
  createdAt: Date;
}
