import { z } from 'zod';

export const PackageArchiveSchema = z.object({
	id: z.string().min(1),
	archivedBy: z.string().min(1),
});

export type PackageArchiveDto = z.infer<typeof PackageArchiveSchema>;
