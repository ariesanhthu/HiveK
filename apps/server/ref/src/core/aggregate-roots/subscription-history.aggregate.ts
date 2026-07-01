import { AggregateRoot } from '../abstract';
import { type SubscriptionChangeDetailsVO } from '../value-objects';
import { type Optional } from '../types';

export interface SubscriptionHistoryProps {
	subscriptionId: string;
	enterpriseId: string;
	billId: Optional<string>;
	actorId: Optional<string>;
	details: SubscriptionChangeDetailsVO;
	createdAt: Date;
}

export type SubscriptionHistoryCreateProps = Omit<SubscriptionHistoryProps, 'createdAt'> & {
	createdAt?: Date;
};

export class SubscriptionHistoryEntity extends AggregateRoot<SubscriptionHistoryProps> {
	public static create(
		input: SubscriptionHistoryCreateProps,
		id?: string
	): SubscriptionHistoryEntity {
		const now = new Date();
		return new SubscriptionHistoryEntity(
			{
				subscriptionId: input.subscriptionId,
				enterpriseId: input.enterpriseId,
				billId: input.billId,
				actorId: input.actorId,
				details: input.details,
				createdAt: input.createdAt ?? now,
			},
			id
		);
	}

	public static instantiate(
		id: string,
		props: SubscriptionHistoryProps
	): SubscriptionHistoryEntity {
		return new SubscriptionHistoryEntity(props, id);
	}

	private constructor(props: SubscriptionHistoryProps, id?: string) {
		super(props, id);
	}

	get subscriptionId(): string {
		return this.props.subscriptionId;
	}

	get enterpriseId(): string {
		return this.props.enterpriseId;
	}

	get billId(): string | undefined {
		return this.props.billId;
	}

	get actorId(): string | undefined {
		return this.props.actorId;
	}

	get details(): SubscriptionChangeDetailsVO {
		return this.props.details;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}
}
