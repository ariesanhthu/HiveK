import { Entity } from './entity.abstract';
import { type IDomainEvent } from '../interfaces';

export abstract class AggregateRoot<T> extends Entity<T> {
	private _domainEvents: IDomainEvent[] = [];

	get domainEvents(): IDomainEvent[] {
		return this._domainEvents;
	}

	public addDomainEvent(domainEvent: IDomainEvent): void {
		this._domainEvents.push(domainEvent);
	}

	public clearDomainEvents(): void {
		this._domainEvents = [];
	}
}
