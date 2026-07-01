import { z } from 'zod';
import { ECurrency, EPackageType, EPackageScope } from '@/core/enums';

export const QuotaItemDtoSchema = z.object({
  code: z.string().min(1),
  limit: z.number(),
});

export const FeatureSchema = z.object({
  code: z.string().min(1),
  permissions: z.array(z.string().min(1)),
});

export const VariantSchema = z.object({
  title: z.string().min(1),
  durationMonths: z.number().int().min(1),
  price: z.number().min(0),
  priceAfterDiscount: z.number().min(0),
  tax: z.number().min(0),
  currency: z.enum([ECurrency.VND, ECurrency.USD]),
  extraQuotas: z.array(QuotaItemDtoSchema),
});

export type QuotaItemDto = z.infer<typeof QuotaItemDtoSchema>;
export type FeatureDto = z.infer<typeof FeatureSchema>;
export type VariantDto = z.infer<typeof VariantSchema>;

export class PackageFeatureDto {
  code: string;
  permissions: string[];
}

export class PackageQuotaDto {
  [key: string]: number;
}

export class PackageVariantDto {
  id: string;
  title: string;
  durationMonths: number;
  price: number;
  priceAfterDiscount: number;
  tax: number;
  currency: string;
  extraQuotas: PackageQuotaDto;
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
  features: PackageFeatureDto[];
  baseQuotas: PackageQuotaDto;
  variants: PackageVariantDto[];
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
}
