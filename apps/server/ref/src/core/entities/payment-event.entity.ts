import { Entity } from '@/core/abstract';
import { type EPaymentEventType } from '../enums';
import { type Nullable } from '@/core/types';
import { type IDomainEvent } from '../interfaces';

export type TriggerType = 'USER' | 'ADMIN' | 'SYSTEM';

export type FieldChange = {
	old: unknown;
	new: unknown;
};

export type FieldChanges = Record<string, FieldChange>;

export interface PaymentEventProps {
	paymentId: string;
	paymentAttemptId: Nullable<string>;
	eventType: EPaymentEventType;
	triggerType: TriggerType;
	triggeredBy: string;
	fieldChanges: FieldChanges;
	occurredAt: Date;
}

export type PaymentEventCreateProps = Omit<
	PaymentEventProps,
	| 'occurredAt'
> & {
	occurredAt?: Date;
};

export class PaymentEventEntity
	extends Entity<PaymentEventProps>
	implements IDomainEvent
{
	public static create(input: PaymentEventCreateProps, id?: string): PaymentEventEntity {
		const now = new Date();
		return new PaymentEventEntity({
			...input,
			occurredAt: input.occurredAt ?? now,
		}, id);
	}

	public static instantiate(id: string, props: PaymentEventProps): PaymentEventEntity {
		return new PaymentEventEntity(props, id);
	}

	private constructor(props: PaymentEventProps, id?: string) {
		super(props, id);
	}
	public get paymentId(): string {
		return this.props.paymentId;
	}
	public get paymentAttemptId(): Nullable<string> {
		return this.props.paymentAttemptId;
	}
	public get eventType(): EPaymentEventType {
		return this.props.eventType;
	}
	public get triggerType(): TriggerType {
		return this.props.triggerType;
	}
	public get triggeredBy(): string {
		return this.props.triggeredBy;
	}
	public get fieldChanges(): FieldChanges {
		return this.props.fieldChanges;
	}
	public get occurredAt(): Date {
		return this.props.occurredAt;
	}

	public getAggregateId(): string {
		return this.props.paymentId;
	}

	public getOccurredAt(): Date {
		return this.props.occurredAt;
	}
}
