import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';

import { SubscriptionCreateDevHandler } from '@/application/commands';
import { PaymentModule } from './payment.module';
import { DevController } from '@/presentation/controllers/grpc/dev.controller';
import {
	CompensatingStepOneActivity,
	CompensatingStepTwoActivity,
	StepOneActivity,
	StepThreeActivity,
	StepTwoActivity,
} from '../durable-execution';
import { TestController } from '@/presentation/controllers/http/test.controller';

const COMMAND_HANDLERS = [SubscriptionCreateDevHandler];

const QUERY_HANDLERS = [];

const WORKFLOW = [
	StepOneActivity,
	StepTwoActivity,
	StepThreeActivity,
	CompensatingStepOneActivity,
	CompensatingStepTwoActivity,
];

@Module({
	imports: [CqrsModule, InfrastructureModule, PaymentModule],
	controllers: [DevController, TestController],
	providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...WORKFLOW],
	exports: [...COMMAND_HANDLERS, ...QUERY_HANDLERS],
})
export class DevModule {}
