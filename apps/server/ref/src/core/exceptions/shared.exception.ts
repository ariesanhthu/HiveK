import { DomainException } from './domain.exception';

export class InvalidPermissionException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
