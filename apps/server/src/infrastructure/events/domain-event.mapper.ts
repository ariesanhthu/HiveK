import { IDomainEventMapper } from '@/application/interfaces/domain-event-mapper.interface';
import { EventMapper } from '@/application/mappers/event.mapper';
import { DomainEvent, IntegrationEvent } from '@/core/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DomainEventMapper implements IDomainEventMapper {
  mapToIntegrationEvents(events: DomainEvent[]): IntegrationEvent[] {
    return EventMapper.mapToIntegrationEvents(events);
  }
}
