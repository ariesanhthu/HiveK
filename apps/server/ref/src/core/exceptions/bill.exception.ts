import { DomainException } from './domain.exception';

export class BillNotFoundException extends DomainException {
	constructor(identifier: string) {
		super(`Bill not found with identifier: ${identifier}`);
	}
}

export class BillCannotCancelException extends DomainException {
	constructor(billId: string, status: string) {
		super(`Bill ${billId} cannot be canceled in its current status: ${status}`);
	}
}

export class BillCreditRefundAmountInvalidException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}

export class BillCreditRefundAmountMismatchException extends DomainException {
	constructor(expected: number, actual: number) {
		super(`Credit refund amount mismatch: expected ${expected}, got ${actual}`);
	}
}

export class BillEnterpriseMismatchException extends DomainException {
	constructor(billId: string, enterpriseId: string) {
		super(`Enterprise ID mismatch for bill ${billId}: expected to own ${enterpriseId}`);
	}
}

export class BillFinalAmountMismatchException extends DomainException {
	constructor(expected: number, actual: number) {
		super(`Final amount mismatch: expected ${expected}, got ${actual}`);
	}
}

export class BillMultiplePlanException extends DomainException {
	constructor(message?: string) {
		super(message || 'Multiple plans are not allowed in a single bill');
	}
}

export class BillTaxAmountMismatchException extends DomainException {
	constructor(expected: number, actual: number) {
		super(`Tax amount mismatch: expected ${expected}, got ${actual}`);
	}
}

export class BillTerminateStatusException extends DomainException {
	constructor(billId: string, status: string) {
		super(`Bill ${billId} is in a terminal status and cannot be modified: ${status}`);
	}
}

export class BillTotalAmountMismatchException extends DomainException {
	constructor(expected: number, actual: number) {
		super(`Total amount mismatch: expected ${expected}, got ${actual}`);
	}
}
