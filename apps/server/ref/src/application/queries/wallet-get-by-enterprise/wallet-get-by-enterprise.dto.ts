import { z } from 'zod';

export const WalletGetByEnterpriseSchema = z.object({
	enterpriseId: z.string().min(1, 'Enterprise ID is required'),
});

export type WalletGetByEnterpriseDto = z.infer<typeof WalletGetByEnterpriseSchema>;
