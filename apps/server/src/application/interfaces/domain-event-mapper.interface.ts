import { DomainEvent, IntegrationEvent } from '@/core/common';

export interface IDomainEventMapper {
  mapToIntegrationEvents(events: DomainEvent[]): IntegrationEvent[];
}

export const DOMAIN_EVENT_MAPPER = Symbol('IDomainEventMapper');
