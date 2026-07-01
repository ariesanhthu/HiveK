export interface IDomainEvent {
	getOccurredAt(): Date;
	getAggregateId(): string;
}
