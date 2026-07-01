import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { type IEventService } from '@/core';
import { AggregateRoot, OutboxEntity, DomainEvent } from '@/core';
import { type ILoggerService, LOGGER_SERVICE, type IUnitOfWorkSession } from '@/core/interfaces';
import { Inject } from '@nestjs/common';
import { EventMapper } from '@/application/mappers';

@Injectable()
export class EventService implements IEventService {
	constructor(
		private readonly eventBus: EventBus,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async publishEvents(
		aggregateRoot: AggregateRoot<unknown>,
		session?: IUnitOfWorkSession
	): Promise<void> {
		const events = aggregateRoot.domainEvents || [];
		this.loggerService.debug(`Events: ${JSON.stringify(events)}`);
		for (const event of events) {
			const eventName = event.constructor.name;
			if (session) {
				const integrationEvents = EventMapper.mapToIntegrationEvent(event as DomainEvent);
				for (const integrationEvent of integrationEvents) {
					this.loggerService.log(
						`Saving integration event to Outbox: ${integrationEvent.eventType}`
					);
					await session.outboxRepository.create(
						OutboxEntity.create({
							eventType: integrationEvent.eventType,
							payload: integrationEvent.payload,
							metadata: integrationEvent.metadata || null,
							transport: integrationEvent.transport || null,
						})
					);
				}
			} else {
				this.loggerService.warn(
					`Publishing event in-memory (No Outbox session provided): ${eventName}`
				);
				this.eventBus.publish(event);
			}
		}

		if (typeof aggregateRoot.clearDomainEvents === 'function') {
			aggregateRoot.clearDomainEvents();
		}
	}
}
