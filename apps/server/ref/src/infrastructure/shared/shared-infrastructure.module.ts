import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EVENT_SERVICE } from '@/core';
import { EventService } from '../services/event/event.service';
import { LOGGER_SERVICE } from '@/core/interfaces';
import { NestLoggerService } from '../services/logger/nest-logger.service';

@Global()
@Module({
	imports: [CqrsModule],
	providers: [
		{
			provide: LOGGER_SERVICE,
			useClass: NestLoggerService,
		},
		{
			provide: EVENT_SERVICE,
			useClass: EventService,
		},
	],
	exports: [LOGGER_SERVICE, EVENT_SERVICE],
})
export class SharedInfrastructureModule {}
