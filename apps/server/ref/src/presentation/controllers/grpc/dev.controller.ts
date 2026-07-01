import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GrpcExceptionFilter } from '@/presentation/middlewares/filters/grpc/global.filter';
import {
	DevServiceControllerMethods,
	type DevServiceController,
} from '@/infrastructure/generated/grpc/payment/repositories/dev.repository';
import type { BillCreateRequest } from '@/infrastructure/generated/grpc/payment/entities/bill.entity';
import type { Empty } from '@/infrastructure/generated/grpc/common/common';
import { SubscriptionCreateDevCommand } from '@/application/commands';
import { PaymentGrpcCaslGuard, PaymentGrpcMetadataExtractGuard } from '@/shared/permissions/casl';
import { getCaslContext } from '@sgod-casl/library';
import { RpcException } from '@nestjs/microservices';

@Controller()
@UseFilters(new GrpcExceptionFilter())
@DevServiceControllerMethods()
export class DevController implements DevServiceController {
	constructor(private readonly commandBus: CommandBus) {}

	// @UseGuards(GrpcJwtAuthGuard)
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	async subscriptionCreateDev(request: BillCreateRequest): Promise<Empty> {
		const ctx = getCaslContext();
		if (!ctx?.userContext?.tenantId) {
			throw new RpcException('Unauthorized');
		}
		const dto = {
			enterpriseId: ctx.userContext.tenantId,
			items: (request.items || []).map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
			})),
		};
		await this.commandBus.execute(new SubscriptionCreateDevCommand(dto));
		return {};
	}
}
