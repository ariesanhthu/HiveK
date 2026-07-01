import { z } from 'zod';

export const BillGetByIdSchema = z.object({
	id: z.string(),
});

export type BillGetByIdDto = z.infer<typeof BillGetByIdSchema>;
