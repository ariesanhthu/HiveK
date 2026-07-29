import { type IMomoPromotionInfo } from './momo-create.interface';

/**
 * Interface for Momo IPN (Instant Payment Notification) callback payload
 */
export interface IMomoIpn {
  /**
   * Mã đối tác của MoMo.
   * Bắt buộc.
   */
  partnerCode: string;

  /**
   * Mã đơn hàng từ bạn (merchant).
   * Bắt buộc.
   */
  orderId: string;

  /**
   * requestId bạn gửi lúc tạo giao dịch.
   * Bắt buộc.
   */
  requestId: string;

  /**
   * Số tiền thanh toán.
   * Bắt buộc.
   */
  amount: number;

  /**
   * Mã cửa hàng.
   */
  storeId?: string;

  /**
   * Thông tin đơn hàng.
   * Tuỳ chọn.
   */
  orderInfo: string;

  /**
   * Mã người dùng của đối tác.
   */
  partnerUserId?: string;

  /**
   * Kiểu đơn hàng, ví dụ "momo_wallet".
   * Tuỳ chọn.
   */
  orderType: string;

  /**
   * Mã giao dịch của MoMo.
   * Bắt buộc.
   */
  transId: number;

  /**
   * Mã kết quả giao dịch: 0 = thành công; khác 0 = thất bại.
   * Bắt buộc.
   */
  resultCode: number;

  /**
   * Mô tả kết quả (ngôn ngữ dựa trên param lang).
   * Bắt buộc.
   */
  message: string;

  /**
   * Hình thức thanh toán: "webApp", "app", "qr", "miniapp" …
   * Bắt buộc.
   */
  payType: string;

  /**
   * Timestamp thời gian trả kết quả về đối tác.
   * Bắt buộc.
   */
  responseTime: number;

  /**
   * extraData bạn gửi lúc tạo giao dịch (base64).
   * Tuỳ chọn.
   */
  extraData: string;

  /**
   * Chữ ký HMAC_SHA256 để kiểm tra tính xác thực của dữ liệu.
   * Bắt buộc.
   */
  signature: string;

  /**
   * Tài khoản/thẻ đã sử dụng: "momo", "pay_later" …
   * Tuỳ chọn.
   */
  paymentOption?: string;

  /**
   * Phí người dùng (long).
   * Tuỳ chọn.
   */
  userFee?: number;

  /**
   * Thông tin voucher/khuyến mãi.
   * Tuỳ chọn.
   */
  promotionInfo?: IMomoPromotionInfo;
}

export interface IMomoSubscriptionIpn extends IMomoIpn {
  /**
   * Callback token.
   */
  callbackToken?: string;

  /**
   * Mã client ID của đối tác.
   */
  partnerClientId?: string;
}
