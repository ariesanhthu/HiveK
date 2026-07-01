import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';

enum ServingStatus {
	UNKNOWN = 0,
	SERVING = 1,
	NOT_SERVING = 2,
	SERVICE_UNKNOWN = 3,
}

@Controller()
export class HealthGrpcController {
	@GrpcMethod('Health', 'Check')
	check(_data: { service: string }): { status: ServingStatus } {
		return { status: ServingStatus.SERVING };
	}

	@GrpcMethod('Health', 'Watch')
	watch(_data: { service: string }): Observable<{ status: ServingStatus }> {
		const subject = new Subject<{ status: ServingStatus }>();
		subject.next({ status: ServingStatus.SERVING });
		return subject.asObservable();
	}
}
