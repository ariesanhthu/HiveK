/**
 * Interface for Momo Create Payment Request
 */
export interface IMomoCreateRequest {
	/**
	 * Mã đối tác (partner code), ví dụ: "MOMOT5BZ20231213_TEST".
	 * Bắt buộc.
	 */
	partnerCode: string;

	/**
	 * Mã đối tác phụ (chỉ dành cho Master Merchant, 3PSP).
	 * Tuỳ chọn.
	 */
	subPartnerCode?: string;

	/**
	 * Tên cửa hàng.
	 * Bắt buộc.
	 */
	storeName?: string;

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
	 * Loại yêu cầu: "payWithMethod" hoặc "captureWallet".
	 * Bắt buộc.
	 */
	requestType: 'payWithMethod' | 'captureWallet';

	/**
	 * Dữ liệu bổ sung (base64 encoded JSON), mặc định "".
	 * Tuỳ chọn.
	 */
	extraData: string;

	/**
	 * Danh sách sản phẩm (tối đa 50 items).
	 * Tuỳ chọn.
	 */
	items?: IMomoItem[];

	/**
	 * Thông tin giao hàng.
	 * Tuỳ chọn.
	 */
	deliveryInfo?: IMomoDeliveryInfo;

	/**
	 * Thông tin người dùng.
	 * Tuỳ chọn.
	 */
	userInfo?: IMomoUserInfo;

	/**
	 * Mã tham chiếu phụ của đối tác.
	 * Tuỳ chọn.
	 */
	referenceId?: string;

	/**
	 * Tự động capture giao dịch (mặc định: true).
	 * Tuỳ chọn.
	 */
	autoCapture?: boolean;

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

/**
 * Interface for Momo Item
 */
export interface IMomoItem {
	/** Mã sản phẩm/SKU. */
	id: string;

	/** Tên sản phẩm. */
	name: string;

	/** Mô tả sản phẩm. */
	description: string;

	/** Danh mục sản phẩm. */
	category: string;

	/** URL hình ảnh. */
	imageUrl: string;

	/** Nhà sản xuất. */
	manufacturer: string;

	/** Giá đơn vị (long). */
	price: number;

	/** Đơn vị tiền tệ (ví dụ: "VND"). */
	currency: string;

	/** Số lượng (integer > 0). */
	quantity: number;

	/** Đơn vị tính. */
	unit: string;

	/** Tổng giá (price × quantity). */
	totalPrice: number;

	/** Thuế (long). */
	taxAmount: number;
}

/**
 * Interface for Momo Delivery Info
 */
export interface IMomoDeliveryInfo {
	/** Địa chỉ giao hàng. */
	deliveryAddress: string;

	/** Phí giao hàng (string). */
	deliveryFee: string;

	/** Số lượng (string). */
	quantity: string;
}

/**
 * Interface for Momo User Info
 */
export interface IMomoUserInfo {
	/** Tên người dùng. */
	name: string;

	/** Số điện thoại. */
	phoneNumber: string;

	/** Email. */
	email: string;
}

/**
 * Interface for Momo Create Payment Response
 */
export interface IMomoCreateResponse {
	/** Mã đối tác. */
	partnerCode: string;

	/** Request ID. */
	requestId: string;

	/** Order ID. */
	orderId: string;

	/** Số tiền. */
	amount: number;

	/** Timestamp (long). */
	responseTime: number;

	/** Thông báo kết quả. */
	message: string;

	/** Mã kết quả (0 = thành công). */
	resultCode: number;

	/** URL thanh toán Momo (tuỳ chọn). */
	payUrl: string;

	/** Deeplink ứng dụng mobile (tuỳ chọn). */
	deeplink?: string;

	/** URL mã QR (tuỳ chọn). */
	qrCodeUrl?: string;

	/** Deeplink mini-app (tuỳ chọn). */
	deeplinkMiniApp?: string;

	/** Phí người dùng (tuỳ chọn). */
	userFee?: number;

	/** Thông tin khuyến mãi (tuỳ chọn). */
	promotionInfo?: IMomoPromotionInfo[] | null;

	/** Chữ ký HMAC_SHA256. */
	signature: string;
}

/**
 * Interface for Momo Promotion Info
 */
export interface IMomoPromotionInfo {
	/** Số tiền khuyến mãi. */
	amount: number;

	/** Số tiền hỗ trợ. */
	amountSponsor: number;

	/** Mã voucher. */
	voucherId: string;

	/** Loại voucher (ví dụ: "Percent"). */
	voucherType: string;

	/** Tên voucher. */
	voucherName: string;

	/** Tỷ lệ merchant (string). */
	merchantRate: string;
}
