import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PackageGrpcExceptionFilter } from '@/presentation/middlewares/filters';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import {
	CaslSubject,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from '@/shared/permissions/casl';
import { PackageServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/package.repository';
import {
	type PackageCreateRequest,
	type PackageUpdateRequest,
	type PackageDeleteRequest,
	type PackageGetListRequest,
	type PackageGetByIdRequest,
	type PackageGetByCodeRequest,
	type PackagePublishRequest,
	type PackageArchiveRequest,
	type PackageResponse,
} from '@/infrastructure/generated/grpc/payment/entities/package.entity';
import type { PackageResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import {
	PackageCreateCommand,
	PackageUpdateCommand,
	PackageDeleteCommand,
	PackagePublishCommand,
	PackageArchiveCommand,
} from '@/application/commands';
import {
	PackageGetListQuery,
	PackageGetByIdQuery,
	PackageGetByCodeQuery,
} from '@/application/queries';
import { Empty } from '@/infrastructure/generated/grpc/common/common';
import { PackageGrpcMapper } from '@/presentation/mappers';
import { Public } from '@/presentation/decorators/public.decorator';

@Controller()
@UseFilters(new PackageGrpcExceptionFilter())
@UseInterceptors(GrpcAutoMapInterceptor)
@PackageServiceControllerMethods()
export class PackageController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly mapper: PackageGrpcMapper
	) {}

	/**
	 * Create a new package
	 * Permissions: CreatePackage (SGOD only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Create, CaslSubject.Package))
	@GrpcAutoResponse({
		subject: CaslSubject.Package,
		mapper: PackageGrpcMapper,
		method: 'toPackageResponse',
	})
	async create(request: PackageCreateRequest): Promise<PackageResponseDto> {
		const dto = this.mapper.toCreateDto(request, false);
		return this.commandBus.execute(new PackageCreateCommand(dto));
	}

	/**
	 * Update an existing package
	 * Permissions: UpdatePackage (SGOD only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Update, CaslSubject.Package))
	@GrpcAutoResponse({
		subject: CaslSubject.Package,
		mapper: PackageGrpcMapper,
		method: 'toPackageResponse',
	})
	async update(request: PackageUpdateRequest): Promise<PackageResponseDto> {
		const dto = this.mapper.toUpdateDto(request, false);
		return this.commandBus.execute(new PackageUpdateCommand(dto));
	}

	/**
	 * Delete a package
	 * Permissions: DeletePackage (SGOD only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Delete, CaslSubject.Package))
	async delete(request: PackageDeleteRequest): Promise<Empty> {
		const dto = this.mapper.toDeleteDto(request);
		await this.commandBus.execute(new PackageDeleteCommand(dto));
		return {};
	}

	/**
	 * Get list of packages
	 * Permissions: Public
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Package))
	@GrpcAutoResponse({
		subject: CaslSubject.Package,
		mapper: PackageGrpcMapper,
		method: 'toPackageListResponse',
	})
	async getList(
		request: PackageGetListRequest
	): Promise<PaginationCursorResponseDto<PackageResponseDto>> {
		const dto = this.mapper.toGetListDto(request, false);
		return this.queryBus.execute(new PackageGetListQuery(dto));
	}

	/**
	 * Get package by ID
	 * Permissions: Public
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Package))
	@GrpcAutoResponse({
		subject: CaslSubject.Package,
		mapper: PackageGrpcMapper,
		method: 'toPackageResponse',
	})
	async getById(request: PackageGetByIdRequest): Promise<PackageResponseDto> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new PackageGetByIdQuery(dto));
	}

	/**
	 * Get package by code
	 * Permissions: Public
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Package))
	@GrpcAutoResponse({
		subject: CaslSubject.Package,
		mapper: PackageGrpcMapper,
		method: 'toPackageResponse',
	})
	async getByCode(request: PackageGetByCodeRequest): Promise<PackageResponseDto> {
		const dto = this.mapper.toGetByCodeDto(request);
		return this.queryBus.execute(new PackageGetByCodeQuery(dto));
	}

	/**
	 * Publish a package
	 * Permissions: ManagePackage (SGOD only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Manage, CaslSubject.Package))
	async publish(request: PackagePublishRequest): Promise<PackageResponse> {
		const result = await this.commandBus.execute(
			new PackagePublishCommand({
				id: request.id,
				publishedBy: request.publishedBy,
			})
		);
		return this.mapper.toPackageResponse(result);
	}

	/**
	 * Archive a package
	 * Permissions: ManagePackage (SGOD only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Manage, CaslSubject.Package))
	async archive(request: PackageArchiveRequest): Promise<Empty> {
		await this.commandBus.execute(
			new PackageArchiveCommand({
				id: request.id,
				archivedBy: request.archivedBy,
			})
		);
		return {};
	}
}
