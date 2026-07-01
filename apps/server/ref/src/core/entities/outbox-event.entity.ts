import { Entity } from '@/core/abstract';

export type EOutboxStatus = 'PENDING' | 'PROCESSED' | 'FAILED';

export class OutboxEventEntity extends Entity<{
	eventType: string;
	payload: Record<string, unknown>;
	status: EOutboxStatus;
	attempts: number;
	lastError?: string;
	createdAt: Date;
	processedAt?: Date;
}> {
	constructor(props: OutboxEventEntity['props'], id?: string) {
		super(props, id);
	}

	public get eventType(): string {
		return this.props.eventType;
	}

	public get payload(): Record<string, unknown> {
		return this.props.payload;
	}

	public get status(): EOutboxStatus {
		return this.props.status;
	}

	public get attempts(): number {
		return this.props.attempts;
	}

	public get lastError(): string | undefined {
		return this.props.lastError;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get processedAt(): Date | undefined {
		return this.props.processedAt;
	}

	public markAsProcessed(): void {
		this.props.status = 'PROCESSED';
		this.props.processedAt = new Date();
	}

	public markAsFailed(errorMsg: string): void {
		this.props.attempts += 1;
		this.props.status = this.props.attempts >= 5 ? 'FAILED' : 'PENDING';
		this.props.lastError = errorMsg;
	}
}
