import { Injectable } from '@nestjs/common';
import { IDomainEventMapper } from '@/application/interfaces/domain-event-mapper.interface';
import { DomainEvent, IntegrationEvent } from '@/core/common';
import { EventMapper } from '@/application/mappers/event.mapper';

@Injectable()
export class DomainEventMapper implements IDomainEventMapper {
  mapToIntegrationEvents(events: DomainEvent[]): IntegrationEvent[] {
    return EventMapper.mapToIntegrationEvents(events);
  }
}
