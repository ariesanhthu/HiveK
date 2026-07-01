import { DomainException } from './domain.exception';

export class WalletNotFoundException extends DomainException {
	constructor(identifier: string) {
		super(`Wallet not found with identifier: ${identifier}`);
	}
}
