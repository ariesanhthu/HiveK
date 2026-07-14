import { z } from 'zod';
import { ECurrency, EPackageType, EPackageScope, EGrantType } from '@/core/enums';

export const GrantDtoSchema = z.object({
  type: z.nativeEnum(EGrantType),
  key: z.string().min(1),
  value: z.number(),
  resetCycle: z.enum(['monthly', 'weekly', 'daily']).optional(),
  creditFallback: z.object({
    creditType: z.string().min(1),
    creditsPerUnit: z.number().positive(),
  }).nullable().optional(),
});

export const VariantSchema = z.object({
  title: z.string().min(1),
  durationMonths: z.number().int().min(1).nullable(),
  price: z.number().min(0),
  priceAfterDiscount: z.number().min(0),
  tax: z.number().min(0),
  currency: z.enum([ECurrency.VND, ECurrency.USD]),
  extraGrants: z.array(GrantDtoSchema),
});

export type GrantDto = z.infer<typeof GrantDtoSchema>;
export type VariantDto = z.infer<typeof VariantSchema>;

export class PackageVariantDto {
  id: string;
  title: string;
  durationMonths: number | null;
  price: number;
  priceAfterDiscount: number;
  tax: number;
  currency: string;
  extraGrants: GrantDto[];
}

export class PackageResponseDto {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  scope: string;
  enterpriseId: string | null;
  status: string;
  features: string[];
  baseGrants: GrantDto[];
  variants: PackageVariantDto[];
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
}
