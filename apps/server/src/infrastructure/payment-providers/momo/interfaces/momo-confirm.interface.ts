import { type EMomoConfirmType, type EMomoLanguage } from '../enums';

/**
 * Interface for Momo Confirm Payment Request (capture hoặc cancel)
 */
export interface IMomoConfirmRequest {
	/**
	 * Mã đối tác.
	 * Bắt buộc.
	 */
	partnerCode: string;

	/**
	 * Định danh duy nhất cho mỗi request (idempotency).
	 * Bắt buộc.
	 */
	requestId: string;

	/**
	 * Mã đơn hàng của đối tác đã xác thực.
	 * Bắt buộc.
	 */
	orderId: string;

	/**
	 * Loại yêu cầu:
	 * - "capture": xác nhận giao dịch thành công.
	 * - "cancel": hủy giao dịch.
	 * Bắt buộc.
	 */
	requestType: EMomoConfirmType;

	/**
	 * Số tiền của hóa đơn cần xác nhận/hủy.
	 * Bắt buộc.
	 */
	amount: number;

	/**
	 * Ngôn ngữ cho trường message trả về ("vi" | "en").
	 * Tuỳ chọn.
	 */
	lang?: EMomoLanguage;

	/**
	 * Mô tả lý do (được dùng trong trường hợp yêu cầu hủy).
	 * Tuỳ chọn.
	 */
	description?: string;

	/**
	 * Chữ ký HMAC_SHA256.
	 * Format: accessKey=$accessKey&amount=$amount&description=$description&orderId=$orderId&partnerCode=$partnerCode&requestId=$requestId&requestType=$requestType
	 * Bắt buộc.
	 */
	signature: string;
}

/**
 * Interface for Momo Confirm Payment Response
 */
export interface IMomoConfirmResponse {
	/**
	 * Mã đối tác.
	 */
	partnerCode: string;

	/**
	 * Request ID của bạn.
	 */
	requestId: string;

	/**
	 * Mã đơn hàng của đối tác.
	 */
	orderId: string;

	/**
	 * Số tiền của hóa đơn gốc.
	 */
	amount: number;

	/**
	 * Mã giao dịch của Momo.
	 */
	transId: number;

	/**
	 * Mã kết quả: thành công, thất bại…
	 */
	resultCode: number;

	/**
	 * Mô tả lỗi hoặc thông báo.
	 */
	message: string;

	/**
	 * Như trong request ("capture" | "cancel").
	 */
	requestType: EMomoConfirmType;

	/**
	 * Timestamp thời gian trả kết quả về cho đối tác.
	 */
	responseTime: number;
}
