import { PackageQuotaDto } from '@/application/dtos';
import z from 'zod';

const SubscriptionChangeDetailsSchema = z.object({
	oldPackages: z.array(z.string()),
	newPackages: z.array(z.string()),
	oldQuotas: PackageQuotaDto,
	newQuotas: PackageQuotaDto,
	oldPermissions: z.array(z.string()),
	newPermissions: z.array(z.string()),
});

export type SubscriptionChangeDetailsDTO = z.infer<typeof SubscriptionChangeDetailsSchema>;

const _subscriptionHistoryResponseSchema = z.object({
	subscriptionId: z.string(),
	enterpriseId: z.string(),
	billId: z.string().nullable(),
	actorId: z.string().nullable(),
	details: SubscriptionChangeDetailsSchema,
	createdAt: z.date(),
});

export type SubscriptionHistoryResponseDTO = z.infer<typeof _subscriptionHistoryResponseSchema>;
