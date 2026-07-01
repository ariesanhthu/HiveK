import { z } from 'zod';

export const PackageGetByCodeSchema = z.object({
	code: z.string(),
});

export type PackageGetByCodeDto = z.infer<typeof PackageGetByCodeSchema>;
