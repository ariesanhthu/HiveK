import { PackageQuotaDto } from '@/application/dtos';
import z from 'zod';

const SubscriptionItemSchema = z.object({
	packageId: z.string(),
	packageVariantId: z.string(),
	startDate: z.date(),
	expiresAt: z.date(),
});

export type SubscriptionItemDTO = z.infer<typeof SubscriptionItemSchema>;

const _subscriptionResponseSchema = z.object({
	enterpriseId: z.string(),
	status: z.string(),
	items: z.array(SubscriptionItemSchema),
	computedQuotas: PackageQuotaDto,
	computedPermissions: z.array(z.string()),
	nextExpiryCheckAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type SubscriptionResponseDTO = z.infer<typeof _subscriptionResponseSchema>;
