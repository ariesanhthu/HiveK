import { z } from 'zod';

export const PackagePublishSchema = z.object({
	id: z.string().min(1),
	publishedBy: z.string().min(1),
});

export type PackagePublishDto = z.infer<typeof PackagePublishSchema>;
