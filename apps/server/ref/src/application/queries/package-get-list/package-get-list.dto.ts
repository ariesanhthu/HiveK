import { EVersionStatus, EPackageType, EPackageScope } from '@/core';
import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const PackageGetListSchema = PaginationCursorQuerySchema.extend({
	code: z.string().optional(),
	status: z.enum(EVersionStatus).optional(),
	type: z.enum(EPackageType).optional(),
	scope: z.enum(EPackageScope).optional(),
	enterpriseId: z.string().optional(),
});

export type PackageGetListDto = z.infer<typeof PackageGetListSchema>;
