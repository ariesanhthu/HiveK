import { z } from 'zod';

export const PackageDeleteSchema = z.object({
	id: z.string().min(1),
	deletedBy: z.string().min(1),
});

export type PackageDeleteDto = z.infer<typeof PackageDeleteSchema>;
