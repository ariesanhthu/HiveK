import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  ECurrency,
  EPackageType,
  EPackageScope,
  EGrantType,
} from '@/core/enums';

export const GrantDtoSchema = z
  .object({
    type: z.enum(EGrantType),
    key: z.string().min(1),
    value: z.number(),
    resetCycle: z.enum(['monthly', 'weekly', 'daily']).optional(),
    creditFallback: z
      .object({
        creditType: z.string().min(1),
        creditsPerUnit: z.number().positive(),
      })
      .nullable()
      .optional(),
  })
  .strict();

export class GrantDto extends createZodDto(GrantDtoSchema) {}

export const VariantSchema = z
  .object({
    title: z.string().min(1),
    durationMonths: z.number().int().min(1).nullable(),
    price: z.number().min(0),
    priceAfterDiscount: z.number().min(0),
    tax: z.number().min(0),
    currency: z.enum([ECurrency.VND, ECurrency.USD]),
    extraGrants: z.array(GrantDtoSchema),
  })
  .strict();

export class VariantDto extends createZodDto(VariantSchema) {}

export const PackageVariantDtoSchema = VariantSchema.extend({
  id: z.string().optional(),
});

export class PackageVariantDto extends createZodDto(PackageVariantDtoSchema) {}

export const PackageResponseDtoSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.string(),
    scope: z.string(),
    enterpriseId: z.string().nullable(),
    status: z.string(),
    features: z.array(z.string()),
    baseGrants: z.array(GrantDtoSchema),
    variants: z.array(PackageVariantDtoSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    activatedAt: z.iso.datetime().optional(),
  })
  .strict();

export class PackageResponseDto extends createZodDto(
  PackageResponseDtoSchema,
) {}
