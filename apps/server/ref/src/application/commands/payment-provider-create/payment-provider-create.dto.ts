import { ECurrency } from '@/core';
import { EPaymentMethod } from '@/core';
import { z } from 'zod';

export const PaymentProviderCreateSchema = z.object({
	code: z.string(),
	displayName: z.string(),
	supportedMethods: z.array(z.enum(EPaymentMethod)),
	supportedCurrencies: z.array(z.enum(ECurrency)),
	credentials: z.record(z.string(), z.unknown()),
	isActive: z.boolean().default(true),
	supportsWebhook: z.boolean().default(false),
	supportsRefund: z.boolean().default(false),
	supportsPartialRefund: z.boolean().default(false),
	baseUrl: z.string().optional(),
	testUrl: z.string().optional(),
	webhookUrl: z.string().optional(),
	createdBy: z.string(),
});

export type PaymentProviderCreateDto = z.infer<typeof PaymentProviderCreateSchema>;
