/**
 * Transaction source indicating technical origin of transaction
 * Represents the communication channel between server and provider gateway
 *
 * Note: Actor (admin, system) is tracked separately in audit layer
 */
export enum ETransactionSource {
	/**
	 * API - Direct API call from server to provider
	 * Server initiates the transaction by calling provider API
	 */
	API = 'API',

	/**
	 * WEBHOOK - Provider webhook notification
	 * Provider sends transaction result/update to server via webhook
	 */
	WEBHOOK = 'WEBHOOK',
}
