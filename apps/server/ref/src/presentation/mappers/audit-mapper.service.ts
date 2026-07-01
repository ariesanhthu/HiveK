import { Injectable, Logger } from '@nestjs/common';
import {
	PaymentEventResponse,
	PaymentEventListResponse,
} from '@/infrastructure/generated/grpc/payment/entities/audit.entity';
import type { PaymentEventResponseDto } from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';

type AuditEventGrpcInput = PaymentEventResponseDto & {
	fromStatus?: string;
	toStatus?: string;
	metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(AuditGrpcMapper.name);

	private auditMetadataToGrpc(metadata: Record<string, unknown>): Record<string, string> {
		return Object.fromEntries(
			Object.entries(metadata).map(([k, v]) => [
				k,
				typeof v === 'string' ? v : JSON.stringify(v ?? null),
			])
		);
	}

	toPaymentEventResponse(result: AuditEventGrpcInput): PaymentEventResponse {
		return {
			...result,
			paymentAttemptId: result.paymentAttemptId ?? '',
			fromStatus: result.fromStatus ?? '',
			toStatus: result.toStatus ?? '',
			occurredAt: result.occurredAt.toISOString(),
			eventType: result.eventType,
			metadata: this.auditMetadataToGrpc(result.metadata || {}),
		};
	}

	toPaymentEventListResponse(
		items: AuditEventGrpcInput[],
		nextCursor?: string
	): PaymentEventListResponse {
		return {
			items: items.map((item) => this.toPaymentEventResponse(item)),
			nextCursor: nextCursor ?? '',
		};
	}
}
