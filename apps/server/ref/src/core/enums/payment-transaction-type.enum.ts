/**
 * Transaction types representing financial operations in 2-phase payment flow
 * Terminology chosen for clarity over industry jargon
 */
export enum EPaymentTransactionType {
	/**
	 * Create - Request payment URL from provider
	 * Used when provider requires separate creation step before authorization
	 * Some providers support direct authorization, some need CREATE first
	 */
	CREATE = 'CREATE',

	/**
	 * Authorization - Hold funds without capturing
	 * Money is held in gateway, not yet charged to user
	 * Reversible via CANCEL
	 */
	AUTHORIZATION = 'AUTHORIZATION',

	/**
	 * Capture - Capture previously authorized funds
	 * Actually charge the user's account
	 * Reversible via REFUND
	 */
	CAPTURE = 'CAPTURE',

	/**
	 * Cancel - Cancel authorization before capture
	 * Release held funds, cannot be done after CAPTURE
	 * Preferred over industry term "VOID" for clarity
	 */
	CANCEL = 'CANCEL',

	/**
	 * Refund - Return captured funds
	 * Can be full or partial (amount determines this)
	 * Partial vs full distinction handled at PaymentAttempt status level
	 */
	REFUND = 'REFUND',
}
