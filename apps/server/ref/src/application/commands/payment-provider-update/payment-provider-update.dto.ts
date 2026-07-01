import { ECurrency } from '@/core';
import { EPaymentMethod } from '@/core';
import { z } from 'zod';

export const PaymentProviderUpdateSchema = z.object({
	id: z.string(),
	displayName: z.string().optional(),
	supportedMethods: z.array(z.enum(EPaymentMethod)).optional(),
	supportedCurrencies: z.array(z.enum(ECurrency)).optional(),
	credentials: z.record(z.string(), z.unknown()).optional(),
	isActive: z.boolean().optional(),
	supportsWebhook: z.boolean().optional(),
	supportsRefund: z.boolean().optional(),
	supportsPartialRefund: z.boolean().optional(),
	baseUrl: z.string().optional(),
	testUrl: z.string().optional(),
	webhookUrl: z.string().optional(),
	updatedBy: z.string(),
});

export type PaymentProviderUpdateDto = z.infer<typeof PaymentProviderUpdateSchema>;
