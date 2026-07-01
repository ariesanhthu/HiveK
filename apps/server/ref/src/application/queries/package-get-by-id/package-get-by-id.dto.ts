import { z } from 'zod';

export const PackageGetByIdSchema = z.object({
	id: z.string(),
});

export type PackageGetByIdDto = z.infer<typeof PackageGetByIdSchema>;
