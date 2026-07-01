import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';
import { type BillEntity } from '../aggregate-roots';

export class BillCreatedEvent extends DomainEvent<{
	billId: string;
	enterpriseId: string;
}> {
	eventType = 'BillCreatedEvent';
	aggregateType = EAggregateType.BILL;

	constructor(public readonly bill: BillEntity) {
		super(bill.id, {
			billId: bill.id,
			enterpriseId: bill.enterpriseId,
		});
	}
}
