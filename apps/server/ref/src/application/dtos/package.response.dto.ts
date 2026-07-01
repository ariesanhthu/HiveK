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
