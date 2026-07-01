import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	type InjectionToken,
} from '@nestjs/common';
import { GrpcMetadataExtractGuard } from '@sgod-casl/library';

interface GrpcMetadataExtractGuardDelegate {
	canActivate(context: ExecutionContext): boolean;
}

/** Wrapper typed local — delegate {@link GrpcMetadataExtractGuard} cho `@UseGuards`. */
@Injectable()
export class PaymentGrpcMetadataExtractGuard implements CanActivate {
	constructor(
		@Inject(GrpcMetadataExtractGuard as InjectionToken)
		private readonly delegate: GrpcMetadataExtractGuardDelegate
	) {}

	canActivate(context: ExecutionContext): boolean {
		return this.delegate.canActivate(context);
	}
}
