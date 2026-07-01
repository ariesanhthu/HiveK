export const momoResponseStatusCodeMapper: Record<number, string> = {
	// Success codes
	0: 'Successful',
	9000: 'Transaction is authorized successfully',

	// Processing codes
	1000: 'Transaction is initiated, waiting for user confirmation',
	7000: 'Transaction is being processed',
	7002: 'Transaction is being processed by the provider of the payment instrument selected',

	// Error codes
	10: 'System is under maintenance',
	11: 'Access denied',
	12: 'Unsupported API version for this request',
	13: 'Merchant authentication failed',
	20: 'Bad format request',
	21: 'Request rejected due to invalid transaction amount',
	22: 'The transaction amount is out of range',
	40: 'Duplicated requestId',
	41: 'Duplicated orderId',
	42: 'Invalid orderId or orderId is not found',
	43: 'Request rejected due to an analogous transaction is being processed',
	45: 'Duplicated ItemId',
	47: 'Request rejected due to inapplicable information in the given set of valuable data',
	98: 'This QR Code has not been generated successfully. Please try again later',
	99: 'Unknown error',
	1001: 'Transaction failed due to insufficient funds',
	1002: 'Transaction rejected by the issuers of the payment methods',
	1003: 'Transaction cancelled after successfully authorized',
	1004: 'Transaction failed because the amount exceeds daily/monthly payment limit',
	1005: 'Transaction failed because the URL or QR code expired',
	1006: 'Transaction failed because user has denied to confirm the payment',
	1007: "Transaction rejected due to inactive or nonexistent user's account",
	1017: 'Transaction cancelled by merchant',
	1026: 'Transaction restricted due to promotion rules',
	1080: 'Refund attempt failed during the processing. Please retry within a short period, preferably after an hour',
	1081: 'Refund rejected. The original transaction might have been refunded',
	1088: 'Refund rejected. The original payment transaction is ineligible to be refunded',
	2019: 'Request rejected due to invalid orderGroupId',
	4001: 'Transaction rejected because the user account is being restricted',
	4002: 'Transaction rejected because the user account has not been verified by C06',
	4100: 'Transaction failed because user has failed to login',
};

// Grouping
const successCodes: number[] = [0, 9000];
const processingCodes: number[] = [1000, 7000, 7002];
const errorCodes: number[] = Object.keys(momoResponseStatusCodeMapper)
	.map(Number)
	.filter((code) => !successCodes.includes(code) && !processingCodes.includes(code));

export function getMomoResultGroup(code: number): 'success' | 'processing' | 'error' | 'unknown' {
	if (successCodes.includes(code)) return 'success';
	if (processingCodes.includes(code)) return 'processing';
	if (errorCodes.includes(code)) return 'error';
	return 'unknown';
}

export function getMomoResultMessage(code: number): string {
	if (momoResponseStatusCodeMapper[code]) return momoResponseStatusCodeMapper[code];
	return 'Unknown error';
}
