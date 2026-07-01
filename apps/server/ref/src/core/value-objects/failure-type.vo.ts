import { ValueObject } from '@/core/abstract';
import { EFailureType } from '../enums';

/**
 * Value Object for failure type with retriability and user messages
 */
export class FailureTypeVO extends ValueObject<{
	type: EFailureType;
	isRetriable: boolean;
	userMessage: string;
}> {
	// Retriable failure types (temporary issues)
	private static readonly RETRIABLE_TYPES = new Set([
		EFailureType.NETWORK,
		EFailureType.TIMEOUT,
		EFailureType.UNKNOWN,
	]);

	// User-friendly messages for each failure type
	private static readonly USER_MESSAGES: Record<EFailureType, string> = {
		[EFailureType.NETWORK]: 'Network error occurred. Please try again.',
		[EFailureType.AUTHENTICATION]:
			'Payment authentication failed. Please check your payment method.',
		[EFailureType.VALIDATION]: 'Invalid payment information. Please check and try again.',
		[EFailureType.INSUFFICIENT_FUNDS]:
			'Insufficient funds. Please use a different payment method.',
		[EFailureType.FRAUD_DETECTED]:
			'Payment blocked for security reasons. Please contact support.',
		[EFailureType.TIMEOUT]: 'Payment request timed out. Please try again.',
		[EFailureType.UNKNOWN]: 'Payment failed. Please try again or contact support.',
	};

	/**
	 * Create FailureTypeVO from enum type
	 */
	public static fromType(type: EFailureType): FailureTypeVO {
		return new FailureTypeVO({
			type,
			isRetriable: FailureTypeVO.RETRIABLE_TYPES.has(type),
			userMessage: FailureTypeVO.USER_MESSAGES[type],
		});
	}

	/**
	 * Get the failure type enum value
	 */
	get type(): EFailureType {
		return this.props.type;
	}

	/**
	 * Check if this failure type is retriable
	 */
	get isRetriable(): boolean {
		return this.props.isRetriable;
	}

	/**
	 * Get user-friendly error message
	 */
	get userMessage(): string {
		return this.props.userMessage;
	}

	/**
	 * Check if failure is non-retriable (permanent)
	 */
	isPermanent(): boolean {
		return !this.isRetriable;
	}
}
