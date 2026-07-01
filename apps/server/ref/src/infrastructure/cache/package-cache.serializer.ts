import {
	PackageEntity,
	PackageFeatureVO,
	PackageVariantEntity,
	QuotaVO,
	type EPackageScope,
	type EPackageType,
	type EVersionStatus,
	type ECurrency,
} from '@/core';

/** Payload JSON lưu trên Redis — không phụ thuộc Mongo document shape. */
export interface PackageCachePayload {
	id: string;
	code: string;
	name: string;
	description: string;
	type: EPackageType;
	scope: EPackageScope;
	enterpriseId: string | null;
	status: EVersionStatus;
	features: { code: string; permissions: string[] }[];
	baseQuotas: Record<string, number>;
	variants: {
		id?: string;
		title: string;
		durationMonths: number;
		price: number;
		priceAfterDiscount: number;
		tax: number;
		currency: ECurrency;
		extraQuotas: Record<string, number>;
	}[];
	createdAt: string;
	updatedAt: string;
	activatedAt?: string;
}

function toQuotaRecord(source: Record<string, number | undefined>): Record<string, number> {
	return Object.fromEntries(
		Object.entries(source).filter((entry): entry is [string, number] => entry[1] !== undefined)
	);
}

export function serializePackage(entity: PackageEntity): string {
	const payload: PackageCachePayload = {
		id: entity.id,
		code: entity.code,
		name: entity.name,
		description: entity.description,
		type: entity.type,
		scope: entity.scope,
		enterpriseId: entity.enterpriseId,
		status: entity.status,
		features: entity.features.map((f) => ({
			code: f.code,
			permissions: [...f.permissions],
		})),
		baseQuotas: toQuotaRecord(entity.baseQuotas.unmarshal),
		variants: entity.variants.map((v) => ({
			id: v.id,
			title: v.title,
			durationMonths: v.durationMonths,
			price: v.price,
			priceAfterDiscount: v.priceAfterDiscount,
			tax: v.tax,
			currency: v.currency,
			extraQuotas: toQuotaRecord(v.extraQuotas.unmarshal),
		})),
		createdAt: entity.createdAt.toISOString(),
		updatedAt: entity.updatedAt.toISOString(),
		activatedAt: entity.activatedAt?.toISOString(),
	};
	return JSON.stringify(payload);
}

export function deserializePackage(raw: string): PackageEntity | null {
	try {
		const p = JSON.parse(raw) as PackageCachePayload;
		return PackageEntity.instantiate(
			p.id,
			{
				code: p.code,
				name: p.name,
				description: p.description,
				type: p.type,
				scope: p.scope,
				enterpriseId: p.enterpriseId,
				status: p.status,
				features: p.features.map(
					(f) => new PackageFeatureVO({ code: f.code, permissions: f.permissions })
				),
				baseQuotas: new QuotaVO(p.baseQuotas),
				variants: p.variants.map(
					(v) =>
						PackageVariantEntity.instantiate(
							v.id!,
							{
								title: v.title,
								durationMonths: v.durationMonths,
								price: v.price,
								priceAfterDiscount: v.priceAfterDiscount,
								tax: v.tax,
								currency: v.currency,
								extraQuotas: new QuotaVO(v.extraQuotas),
							},
						)
				),
				createdAt: new Date(p.createdAt),
				updatedAt: new Date(p.updatedAt),
				activatedAt: p.activatedAt ? new Date(p.activatedAt) : undefined,
			},
		);
	} catch {
		return null;
	}
}
