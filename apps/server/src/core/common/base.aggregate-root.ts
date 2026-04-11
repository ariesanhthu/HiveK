import { BaseEntity } from './base.entity';

export abstract class BaseAggregateRoot<Props> extends BaseEntity<Props> {
  // Can be expanded later to hold Domain Events, which are dispatched by the Unit of Work.
  // private _domainEvents: any[] = [];
  
  // get domainEvents(): any[] {
  //   return this._domainEvents;
  // }
  
  // protected addDomainEvent(domainEvent: any): void {
  //   this._domainEvents.push(domainEvent);
  // }
  
  // public clearEvents(): void {
  //   this._domainEvents = [];
  // }
}
