import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GrpcCaslGuard } from '@sgod-casl/library';

/** Wrapper typed local — delegate {@link GrpcCaslGuard} cho `@UseGuards`. */
@Injectable()
export class PaymentGrpcCaslGuard implements CanActivate {
	constructor(private readonly delegate: GrpcCaslGuard) {}

	canActivate(context: ExecutionContext): boolean {
		return this.delegate.canActivate(context);
	}
}
