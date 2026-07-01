import { z } from 'zod';
import { FeatureSchema, QuotaItemDtoSchema, VariantSchema } from '../../dtos/package-common.dto';
import { EPackageType, EPackageScope } from '@/core';

// UpdateVariantDto extends VariantSchema but makes fields optional + requires ID
const UpdateVariantSchema = VariantSchema.partial().extend({
	id: z.string().min(1),
});

export const PackageUpdateSchema = z.object({
	id: z.string().min(1),
	updatedBy: z.string().min(1),

	// Metadata
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	type: z.enum(EPackageType).optional(),
	scope: z.enum(EPackageScope).optional(),

	// General Info (Optional - overwrite if present)
	features: z.array(FeatureSchema).optional(),
	baseQuotas: z.array(QuotaItemDtoSchema).optional(),

	// Variant Management
	currentVariants: z.array(UpdateVariantSchema).optional(),
	newVariants: z.array(VariantSchema).optional(),
	deletedVariants: z.array(z.string().min(1)).optional(),
});

export type UpdateVariantDto = z.infer<typeof UpdateVariantSchema>;
export type PackageUpdateDto = z.infer<typeof PackageUpdateSchema>;
