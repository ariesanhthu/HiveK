/**
 * Interface for Momo Refund Request
 */
export interface IMomoRefundRequest {
  /**
   * Mã đối tác (merchant).
   * Bắt buộc.
   */
  partnerCode: string;

  /**
   * Mã đơn hàng mới cho yêu cầu hoàn tiền (không được trùng với orderId ban đầu).
   * Bắt buộc.
   */
  orderId: string;

  /**
   * ID của yêu cầu — duy nhất mỗi lần gọi (idempotency).
   * Bắt buộc.
   */
  requestId: string;

  /**
   * Số tiền cần hoàn (long).
   * Tối thiểu: 1.000 VND (10.000 VND với Local ATM Card).
   * Tối đa: 50.000.000 VND (30.000.000 VND với Tokenization).
   * Bắt buộc.
   */
  amount: number;

  /**
   * Mã giao dịch của Momo (transId từ giao dịch thanh toán ban đầu).
   * Bắt buộc.
   */
  transId: number;

  /**
   * Ngôn ngữ cho trường message trả về ("vi" | "en").
   * Tuỳ chọn.
   */
  lang?: 'vi' | 'en';

  /**
   * Mô tả yêu cầu hoàn tiền.
   * Tuỳ chọn.
   */
  description?: string;

  /**
   * Danh sách chi tiết các phần giao dịch cần hoàn tiền (dành cho "Buy Now Pay Later").
   * Tuỳ chọn.
   */
  transGroup?: IMomoRefundItem[];

  /**
   * Chữ ký HMAC_SHA256.
   * Format: accessKey=$accessKey&amount=$amount&description=$description&orderId=$orderId&partnerCode=$partnerCode&requestId=$requestId&transId=$transId
   * Bắt buộc.
   */
  signature: string;
}

/**
 * Interface for Momo Refund Item (cho Buy Now Pay Later)
 */
export interface IMomoRefundItem {
  /**
   * ID của item.
   */
  itemId: string;

  /**
   * Số tiền của item cần hoàn.
   */
  amount: number;

  /**
   * Mã giao dịch Momo của item đó.
   */
  transId: number;
}

/**
 * Interface for Momo Refund Response
 */
export interface IMomoRefundResponse {
  /**
   * Mã đối tác.
   */
  partnerCode: string;

  /**
   * Request ID của bạn — trùng với request gửi.
   */
  requestId: string;

  /**
   * Mã đơn hàng mà bạn dùng cho yêu cầu hoàn tiền.
   */
  orderId: string;

  /**
   * Số tiền hoàn đã xử lý.
   */
  amount: number;

  /**
   * Mã kết quả (ví dụ: 0 = thành công).
   */
  resultCode: number;

  /**
   * Thông báo trạng thái (ngôn ngữ dựa theo `lang`).
   */
  message: string;

  /**
   * (Có thể) Mã giao dịch Momo cho yêu cầu hoàn tiền.
   * Tuỳ chọn.
   */
  transId?: number;

  /**
   * Thời gian trả kết quả (timestamp).
   */
  responseTime: number;

  /**
   * Chữ ký HMAC_SHA256 của phản hồi.
   */
  signature: string;
}
