import { Injectable, Logger } from '@nestjs/common';
import {
	PackageResponse,
	PackageCreateRequest,
	PackageUpdateRequest,
	PackageDeleteRequest,
	PackageGetListRequest,
	PackageGetByIdRequest,
	PackageGetByCodeRequest,
	PackageListResponse,
} from '@/infrastructure/generated/grpc/payment/entities/package.entity';
import {
	PackageGetListDto,
	PackageGetByIdDto,
	PackageGetByCodeDto,
	PackageGetListSchema,
	PackageGetByIdSchema,
	PackageGetByCodeSchema,
} from '@/application/queries';
import { PackageResponseDto } from '@/application/dtos';
import {
	PackageCreateDto,
	PackageUpdateDto,
	PackageDeleteDto,
	PackageCreateSchema,
	PackageUpdateSchema,
	PackageDeleteSchema,
} from '@/application/commands';
import { BaseGrpcMapper } from './base-grpc.mapper';
import {
	toDomainPackageType,
	toProtoPackageType,
	toDomainPackageScope,
	toProtoPackageScope,
	toProtoVersionStatus,
	toDomainCurrency,
	toProtoCurrency,
	toDomainSortOrder,
} from './grpc-enum.mapper';

@Injectable()
export class PackageGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(PackageGrpcMapper.name);

	// --- Request to DTO Transformation ---

	toCreateDto(request: PackageCreateRequest, strict = false): PackageCreateDto {
		this.logger.debug('toCreateDto', request);
		const raw = {
			code: request.code,
			type: toDomainPackageType(request.type, strict),
			scope: toDomainPackageScope(request.scope, strict),
			name: request.name,
			description: request.description,
			enterpriseId: request.enterpriseId || undefined,
			createdBy: request.createdBy,
		};
		return this.validate(PackageCreateSchema, raw);
	}

	toUpdateDto(request: PackageUpdateRequest, strict = false): PackageUpdateDto {
		this.logger.debug('toUpdateDto', request);
		const raw = {
			id: request.id,
			name: request.name,
			description: request.description,
			updatedBy: request.updatedBy,
			type: toDomainPackageType(request.type, strict),
			scope: toDomainPackageScope(request.scope, strict),
			features: request.features,
			baseQuotas: request.baseQuotas,
			currentVariants: (request.currentVariants || []).map((v) => ({
				id: v.id,
				title: v.title,
				durationMonths: Number(v.durationMonths),
				price: Number(v.price),
				priceAfterDiscount: Number(v.priceAfterDiscount),
				tax: Number(v.tax),
				currency: toDomainCurrency(v.currency),
				extraQuotas: v.extraQuotas || [],
			})),
			newVariants: (request.newVariants || []).map((v) => ({
				title: v.title,
				durationMonths: v.durationMonths,
				price: v.price,
				priceAfterDiscount: v.priceAfterDiscount,
				tax: v.tax,
				currency: toDomainCurrency(v.currency),
				extraQuotas: v.extraQuotas || [],
			})),
			deletedVariants: request.deletedVariants,
		};
		return this.validate(PackageUpdateSchema, raw);
	}

	toDeleteDto(request: PackageDeleteRequest): PackageDeleteDto {
		this.logger.debug('toDeleteDto', request);
		const raw = {
			id: request.id,
			deletedBy: request.deletedBy,
		};
		return this.validate(PackageDeleteSchema, raw);
	}

	toGetListDto(request: PackageGetListRequest, strict = false): PackageGetListDto {
		// this.logger.debug('toGetListDto', request);
		const raw = {
			limit: request.limit || 10,
			cursor: request.cursor || undefined,
			sortOrder: toDomainSortOrder(request.sortOrder),
			scope: toDomainPackageScope(request.scope, strict),
			type: toDomainPackageType(request.type, strict),
			enterpriseId: request.enterpriseId,
			status: request.status,
		};
		return this.validate(PackageGetListSchema, raw);
	}

	toGetByIdDto(request: PackageGetByIdRequest): PackageGetByIdDto {
		this.logger.debug('toGetByIdDto', request);
		return this.validate(PackageGetByIdSchema, { id: request.id });
	}

	toGetByCodeDto(request: PackageGetByCodeRequest): PackageGetByCodeDto {
		this.logger.debug('toGetByCodeDto', request);
		return this.validate(PackageGetByCodeSchema, { code: request.code });
	}

	// --- Response Transformation ---

	toPackageResponse(dto: PackageResponseDto): PackageResponse {
		return {
			id: dto.id,
			code: dto.code,
			type: toProtoPackageType(dto.type),
			scope: toProtoPackageScope(dto.scope),
			name: dto.name,
			description: dto.description,
			enterpriseId: dto.enterpriseId || undefined,
			status: toProtoVersionStatus(dto.status),
			createdAt: dto.createdAt?.toISOString(),
			updatedAt: dto.updatedAt?.toISOString(),
			activatedAt: dto.activatedAt?.toISOString() || undefined,
			baseQuotas: Object.entries(dto.baseQuotas || {}).map(([code, limit]) => ({
				code,
				limit,
			})),
			features: dto.features,
			variants: dto.variants?.map((v) => ({
				variantId: v.id,
				title: v.title,
				durationMonths: v.durationMonths,
				price: v.price,
				priceAfterDiscount: v.priceAfterDiscount,
				tax: v.tax,
				currency: toProtoCurrency(v.currency),
				extraQuotas: Object.entries(v.extraQuotas).map(([code, limit]) => ({
					code,
					limit,
				})),
			})),
		};
	}

	toPackageListResponse(items: PackageResponseDto[], nextCursor?: string): PackageListResponse {
		return {
			items: items.map((item) => this.toPackageResponse(item)),
			nextCursor,
		};
	}
}
