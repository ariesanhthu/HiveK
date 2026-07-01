import { z } from 'zod';
import { EPackageType, EPackageScope } from '@/core';

export const PackageCreateSchema = z.object({
	code: z.string().min(1),
	name: z.string().min(1),
	description: z.string().min(1),
	type: z.enum(EPackageType),
	scope: z.enum(EPackageScope),
	enterpriseId: z.string().optional().nullable(),
});

export type PackageCreateDto = z.infer<typeof PackageCreateSchema>;
