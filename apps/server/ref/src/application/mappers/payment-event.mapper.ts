import { type PaymentEventEntity } from '@/core';
import { type PaymentEventResponseDto } from '../dtos';

export class PaymentEventMapper {
	static toDto(entity: PaymentEventEntity): PaymentEventResponseDto {
		return {
			id: entity.id,
			paymentId: entity.paymentId,
			paymentAttemptId: entity.paymentAttemptId,
			eventType: entity.eventType,
			triggerType: entity.triggerType,
			triggeredBy: entity.triggeredBy,
			fieldChanges: entity.fieldChanges,
			occurredAt: entity.occurredAt,
		};
	}

	static toDtoList(entities: PaymentEventEntity[]): PaymentEventResponseDto[] {
		return entities.map((entity) => this.toDto(entity));
	}
}
