import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { PackageController } from '@/presentation/controllers/grpc/package.controller';
import { PackageGrpcMapper } from '@/presentation/mappers';

import {
	PackageCreateHandler,
	PackageUpdateHandler,
	PackagePublishHandler,
	PackageArchiveHandler,
	PackageDeleteHandler,
} from '@/application/commands';

import {
	PackageGetListHandler,
	PackageGetByIdHandler,
	PackageGetByCodeHandler,
} from '@/application/queries';

const COMMAND_HANDLERS = [
	PackageCreateHandler,
	PackageUpdateHandler,
	PackagePublishHandler,
	PackageArchiveHandler,
	PackageDeleteHandler,
];

const QUERY_HANDLERS = [PackageGetListHandler, PackageGetByIdHandler, PackageGetByCodeHandler];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [PackageController],
	providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, PackageGrpcMapper],
	exports: [...COMMAND_HANDLERS, ...QUERY_HANDLERS],
})
export class PackageModule {}
