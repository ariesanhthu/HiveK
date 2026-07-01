import { DomainException } from '@/core/exceptions';

export class PaymentProviderDomainException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}

export class PaymentProviderDisabledException extends PaymentProviderDomainException {
	constructor() {
		super(`Provider disabled.`);
	}
}

export class PaymentProviderNotFoundException extends PaymentProviderDomainException {
	constructor(id: string) {
		super(`Payment Provider not found with id: ${id}`);
	}
}

export class PaymentProviderAlreadyExistsException extends PaymentProviderDomainException {
	constructor(code: string) {
		super(`Payment Provider already exists with code: ${code}`);
	}
}

export class InvalidProviderCredentialsException extends PaymentProviderDomainException {
	constructor(code: string) {
		super(`Invalid credentials for provider: ${code}`);
	}
}
