/**
 * Interface for Momo Create Payment Request
 */
export interface IMomoCreateWithSubscriptionRequest {
	/**
	 * Mã đối tác (partner code), ví dụ: "MOMOT5BZ20231213_TEST".
	 * Bắt buộc.
	 */
	partnerCode: string;

	partnerName?: string;

	/**
	 * Mã cửa hàng.
	 * Bắt buộc.
	 */
	storeId?: string;

	/**
	 * Mã yêu cầu duy nhất (idempotent).
	 * Bắt buộc.
	 */
	requestId: string;

	/**
	 * Số tiền thanh toán (long).
	 * Tối thiểu: 1.000 VND, Tối đa: 50.000.000 VND.
	 * Bắt buộc.
	 */
	amount: number;

	/**
	 * Mã đơn hàng của merchant.
	 * Bắt buộc.
	 */
	orderId: string;

	/**
	 * Thông tin đơn hàng.
	 * Bắt buộc.
	 */
	orderInfo: string;

	/**
	 * Mã nhóm đơn hàng do Momo cung cấp (long).
	 * Tuỳ chọn.
	 */
	orderGroupId?: number;

	/**
	 * URL để chuyển hướng người dùng sau thanh toán.
	 * Bắt buộc.
	 */
	redirectUrl: string;

	/**
	 * URL callback IPN (server-to-server).
	 * Bắt buộc.
	 */
	ipnUrl: string;

	/**
	 * Mã client ID của đối tác (VD _id của enterprise)
	 * Bắt buộc.
	 */
	partnerClientId: string;

	/**
	 * Dữ liệu bổ sung (base64 encoded JSON), mặc định "".
	 * Tuỳ chọn.
	 */
	extraData: string;

	/**
	 * Loại yêu cầu: "payWithMethod" hoặc "captureWallet".
	 * Bắt buộc.
	 */
	requestType: 'subscription';

	/**
	 * Ngôn ngữ phản hồi ("vi" | "en").
	 * Tuỳ chọn.
	 */
	lang: 'vi' | 'en';

	/**
	 * Chữ ký HMAC_SHA256.
	 * Bắt buộc.
	 */
	signature: string;
}

export interface IMomoSubscriptionInfo {
	name: string;
	partnerSubsId: string;
	subsOwener: string;

	/**
	 * The amount to be charged in each frequency cycle can be fixed or capped to max amount.
	 * FIXED: Amount charged in each frequency cycle will be the same as recurringAmount
	 * VARIABLE: Amount charged in each frequency cycle can be variable
	 */
	type: 'FIXED' | 'VARIABLE';

	/**
	 * Amount to be charged to the customer in each frequency cycle.
	 * If type is FIXED, it is the fixed amount that can be charged to the customer in each frequency cycle.
	 * If type is VARIABLE, it is the maximum amount that can be charged to the customer in each frequency cycle.
	 */
	recurringAmount: number;

	/**
	 * The frequency of the recurring payment.
	 */
	frequency:
		| 'DAILY'
		| 'WEEKLY'
		| 'BI_WEEKLY'
		| 'MONTHLY'
		| 'BI_MONTHLY'
		| 'QUARTERLY'
		| 'SEMI_ANNUALLY'
		| 'ANNUALLY';

	/**
	 * YYYY-MM-DD
	 */
	nextPaymentDate: string;

	/**
	 * YYYY-MM-DD
	 */
	expiryDate: string;
}

/**
 * Interface for Momo Create Payment Response
 */
export interface IMomoCreateWithSubscriptionResponse {
	/** Mã đối tác. */
	partnerCode: string;

	/** Request ID. */
	requestId: string;

	/** Order ID. */
	orderId: string;

	/** Số tiền. */
	amount: number;

	/** URL thanh toán Momo (tuỳ chọn). */
	payUrl: string;

	/** Deeplink ứng dụng mobile (tuỳ chọn). */
	deeplink?: string;

	/** URL mã QR (tuỳ chọn). */
	qrCodeUrl?: string;

	/** Deeplink mini-app (tuỳ chọn). */
	deeplinkMiniApp?: string;

	/** Mã kết quả (0 = thành công). */
	resultCode: number;

	/** Thông báo kết quả. */
	message: string;

	/** Timestamp (long). */
	responseTime: number;

	partnerClientId: string;
}

export interface IMomoSubscriptionRequest {
	/**
	 * Integration information.
	 */
	partnerCode: string;

	/**
	 * Callback token as access token, received from payment result.
	 */
	callbackToken: string;

	/**
	 * Request ID, unique for each request, MoMo's partner uses the requestId field for idempotency control.
	 */
	requestId: string;

	/**
	 * Initial OrderId.
	 */
	orderId: string;

	/**
	 * Identifier of transaction with saved token.
	 */
	partnerClientId: string;

	/**
	 * Language of returned message (vi or en).
	 */
	lang: 'vi' | 'en';

	/**
	 * Signature to confirm information. Secure transaction in Hmac_SHA256  algorithm with format: a String sort all key name of data field from a-z:
	accessKey=$accessKey&callbackToken=$callbackToken&orderId=
	$orderId&partnerClientId=$partnerClientId&partnerCode=
	$partnerCode&requestId=$requestId
	*/
	signature: string;
}
