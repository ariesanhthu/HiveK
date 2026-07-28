/**
 * Example: Event Mapper — Domain Events → Integration Events
 *
 * Shows: How domain events from aggregates are mapped to integration events
 * with transport metadata for reliable async delivery via outbox + Kafka.
 *
 * See src/applications/mappers/event.mapper.ts for the real implementation.
 */
import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@domain/events/domain-event.base';
import { IntegrationEvent } from '@domain/events/integration-event.base';
import { IDomainEventMapper } from '@applications/ports/domain-event-mapper.interface';

@Injectable()
export class DomainEventMapper implements IDomainEventMapper {
  mapToIntegrationEvents(domainEvents: DomainEvent[]): IntegrationEvent[] {
    return domainEvents.map(event => {
      switch (event.eventType) {
        case 'asset.created':
          return new IntegrationEvent('asset.created', event.payload, {
            correlationId: event.aggregateId,
          }, {
            routingKey: 'asset.created',
          });

        case 'asset.updated':
          return new IntegrationEvent('asset.updated', event.payload, {
            correlationId: event.aggregateId,
          }, {
            routingKey: 'asset.updated',
          });

        default:
          // Unknown events are wrapped with a generic routing key
          return new IntegrationEvent(event.eventType, event.payload, null, {
            routingKey: 'domain.event.unknown',
          });
      }
    });
  }
}
