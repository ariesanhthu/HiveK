/**
 * Centralized Proto ↔ Domain Enum Mappings
 *
 * This file contains all enum conversion functions used by gRPC mappers.
 * Keeps proto-specific concerns isolated from domain logic.
 */

import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

// Proto imports
import {
	Currency as ProtoCurrency,
	SortOrder as ProtoSortOrder,
} from '@/infrastructure/generated/grpc/common/common';
import {
	PackageType as ProtoPackageType,
	PackageScope as ProtoPackageScope,
	PackageStatus as ProtoPackageStatus,
} from '@/infrastructure/generated/grpc/payment/entities/package.entity';
import {
	BillStatus as ProtoBillStatus,
	BillType as ProtoBillType,
	PurchaseType as ProtoPurchaseType,
} from '@/infrastructure/generated/grpc/payment/entities/bill.entity';
import {
	PaymentStatus as ProtoPaymentStatus,
	TransactionType as ProtoTransactionType,
} from '@/infrastructure/generated/grpc/payment/entities/payment.entity';
import { PaymentMethod as ProtoPaymentMethod } from '@/infrastructure/generated/grpc/payment/entities/payment-provider.entity';

// Domain imports
import { ECurrency } from '@/core';
import { ESortOrder } from '@/shared/enums';
import { EPackageType, EPackageScope, EVersionStatus } from '@/core';
import { EBillStatus, EBillType, EPurchaseType } from '@/core';
import { EPaymentStatus, EPaymentTransactionType } from '@/core';
import { EPaymentMethod } from '@/core';

// --- Helper ---

function createEnumError(enumName: string): RpcException {
	return new RpcException({
		code: grpc.status.INVALID_ARGUMENT,
		message: `Invalid ${enumName}`,
	});
}

// ============================================================================
// Currency
// ============================================================================

export function toDomainCurrency(proto: ProtoCurrency | undefined): ECurrency {
	switch (proto) {
		case ProtoCurrency.CURRENCY_VND:
			return ECurrency.VND;
		case ProtoCurrency.CURRENCY_USD:
			return ECurrency.USD;
		default:
			return ECurrency.VND;
	}
}

export function toProtoCurrency(domain: ECurrency | string): ProtoCurrency {
	switch (domain as ECurrency) {
		case ECurrency.VND:
			return ProtoCurrency.CURRENCY_VND;
		case ECurrency.USD:
			return ProtoCurrency.CURRENCY_USD;
		default:
			return ProtoCurrency.CURRENCY_UNSPECIFIED;
	}
}

// ============================================================================
// SortOrder
// ============================================================================

export function toDomainSortOrder(proto: ProtoSortOrder | undefined): ESortOrder | undefined {
	switch (proto) {
		case ProtoSortOrder.SORT_ORDER_ASC:
			return ESortOrder.ASC;
		case ProtoSortOrder.SORT_ORDER_DESC:
			return ESortOrder.DESC;
		default:
			return undefined;
	}
}

export function toProtoSortOrder(domain: ESortOrder | undefined): ProtoSortOrder {
	switch (domain) {
		case ESortOrder.ASC:
			return ProtoSortOrder.SORT_ORDER_ASC;
		case ESortOrder.DESC:
			return ProtoSortOrder.SORT_ORDER_DESC;
		default:
			return ProtoSortOrder.SORT_ORDER_UNSPECIFIED;
	}
}

// ============================================================================
// PackageType
// ============================================================================

export function toDomainPackageType(
	proto: ProtoPackageType | undefined,
	strict = false
): EPackageType | undefined {
	switch (proto) {
		case ProtoPackageType.PACKAGE_TYPE_PLAN:
			return EPackageType.PLAN;
		case ProtoPackageType.PACKAGE_TYPE_ADDON:
			return EPackageType.ADDON;
		default:
			if (strict) throw createEnumError('PackageType');
			return undefined;
	}
}

export function toProtoPackageType(domain: EPackageType | string): ProtoPackageType {
	switch (domain as EPackageType) {
		case EPackageType.PLAN:
			return ProtoPackageType.PACKAGE_TYPE_PLAN;
		case EPackageType.ADDON:
			return ProtoPackageType.PACKAGE_TYPE_ADDON;
		default:
			return ProtoPackageType.PACKAGE_TYPE_UNSPECIFIED;
	}
}

// ============================================================================
// PackageScope
// ============================================================================

export function toDomainPackageScope(
	proto: ProtoPackageScope | undefined,
	strict = false
): EPackageScope | undefined {
	switch (proto) {
		case ProtoPackageScope.PACKAGE_SCOPE_PUBLIC:
			return EPackageScope.PUBLIC;
		case ProtoPackageScope.PACKAGE_SCOPE_PRIVATE:
			return EPackageScope.PRIVATE;
		default:
			if (strict) throw createEnumError('PackageScope');
			return undefined;
	}
}

export function toProtoPackageScope(domain: EPackageScope | string): ProtoPackageScope {
	switch (domain as EPackageScope) {
		case EPackageScope.PUBLIC:
			return ProtoPackageScope.PACKAGE_SCOPE_PUBLIC;
		case EPackageScope.PRIVATE:
			return ProtoPackageScope.PACKAGE_SCOPE_PRIVATE;
		default:
			return ProtoPackageScope.PACKAGE_SCOPE_UNSPECIFIED;
	}
}

// ============================================================================
// PackageStatus
// ============================================================================

export function toDomainVersionStatus(
	proto: ProtoPackageStatus | undefined,
	strict = false
): EVersionStatus | undefined {
	switch (proto) {
		case ProtoPackageStatus.PACKAGE_STATUS_DRAFT:
			return EVersionStatus.DRAFT;
		case ProtoPackageStatus.PACKAGE_STATUS_ACTIVE:
			return EVersionStatus.ACTIVE;
		case ProtoPackageStatus.PACKAGE_STATUS_ARCHIVED:
			return EVersionStatus.ARCHIVED;
		default:
			if (strict) throw createEnumError('PackageStatus');
			return undefined;
	}
}

export function toProtoVersionStatus(domain: EVersionStatus | string): ProtoPackageStatus {
	switch (domain as EVersionStatus) {
		case EVersionStatus.DRAFT:
			return ProtoPackageStatus.PACKAGE_STATUS_DRAFT;
		case EVersionStatus.ACTIVE:
			return ProtoPackageStatus.PACKAGE_STATUS_ACTIVE;
		case EVersionStatus.ARCHIVED:
			return ProtoPackageStatus.PACKAGE_STATUS_ARCHIVED;
		default:
			return ProtoPackageStatus.PACKAGE_STATUS_UNSPECIFIED;
	}
}

// ============================================================================
// BillStatus
// ============================================================================

export function toDomainBillStatus(
	proto: ProtoBillStatus | undefined,
	strict = false
): EBillStatus | undefined {
	switch (proto) {
		case ProtoBillStatus.BILL_STATUS_PENDING:
			return EBillStatus.PENDING;
		case ProtoBillStatus.BILL_STATUS_DONE:
			return EBillStatus.DONE;
		case ProtoBillStatus.BILL_STATUS_CANCELLED:
			return EBillStatus.CANCELLED;
		default:
			if (strict) throw createEnumError('BillStatus');
			return undefined;
	}
}

export function toProtoBillStatus(domain: EBillStatus | string): ProtoBillStatus {
	switch (domain as EBillStatus) {
		case EBillStatus.PENDING:
			return ProtoBillStatus.BILL_STATUS_PENDING;
		case EBillStatus.DONE:
			return ProtoBillStatus.BILL_STATUS_DONE;
		case EBillStatus.CANCELLED:
			return ProtoBillStatus.BILL_STATUS_CANCELLED;
		default:
			return ProtoBillStatus.BILL_STATUS_UNSPECIFIED;
	}
}

// ============================================================================
// BillType
// ============================================================================

export function toProtoBillType(domain: EBillType | string): ProtoBillType {
	switch (domain as EBillType) {
		case EBillType.PURCHASE:
			return ProtoBillType.BILL_TYPE_PURCHASE;
		case EBillType.REFUND:
			return ProtoBillType.BILL_TYPE_REFUND;
		default:
			return ProtoBillType.BILL_TYPE_UNSPECIFIED;
	}
}

// ============================================================================
// PurchaseType
// ============================================================================

export function toDomainPurchaseType(
	proto: ProtoPurchaseType | undefined,
	strict = false
): EPurchaseType | undefined {
	switch (proto) {
		case ProtoPurchaseType.PURCHASE_TYPE_RENEWAL:
			return EPurchaseType.RENEWAL;
		case ProtoPurchaseType.PURCHASE_TYPE_NEW:
			return EPurchaseType.NEW;
		case ProtoPurchaseType.PURCHASE_TYPE_CANCELLED:
			return EPurchaseType.CANCELLED;
		default:
			if (strict) throw createEnumError('PurchaseType');
			return undefined;
	}
}

export function toProtoPurchaseType(domain: EPurchaseType | string): ProtoPurchaseType {
	switch (domain as EPurchaseType) {
		case EPurchaseType.RENEWAL:
			return ProtoPurchaseType.PURCHASE_TYPE_RENEWAL;
		case EPurchaseType.NEW:
			return ProtoPurchaseType.PURCHASE_TYPE_NEW;
		case EPurchaseType.CANCELLED:
			return ProtoPurchaseType.PURCHASE_TYPE_CANCELLED;
		default:
			return ProtoPurchaseType.PURCHASE_TYPE_UNSPECIFIED;
	}
}

// ============================================================================
// PaymentStatus
// ============================================================================

export function toDomainPaymentStatus(
	proto: ProtoPaymentStatus | undefined,
	strict = false
): EPaymentStatus | undefined {
	switch (proto) {
		case ProtoPaymentStatus.PAYMENT_STATUS_PENDING_PAYMENT_PROVIDER:
			return EPaymentStatus.PENDING_PAYMENT_PROVIDER;
		case ProtoPaymentStatus.PAYMENT_STATUS_PENDING:
			return EPaymentStatus.PENDING;
		case ProtoPaymentStatus.PAYMENT_STATUS_PROCESSING:
			return EPaymentStatus.PROCESSING;
		case ProtoPaymentStatus.PAYMENT_STATUS_COMPLETED:
			return EPaymentStatus.COMPLETED;
		case ProtoPaymentStatus.PAYMENT_STATUS_FAILED:
			return EPaymentStatus.FAILED;
		case ProtoPaymentStatus.PAYMENT_STATUS_PARTIALLY_REFUNDED:
			return EPaymentStatus.PARTIALLY_REFUNDED;
		case ProtoPaymentStatus.PAYMENT_STATUS_REFUNDED:
			return EPaymentStatus.REFUNDED;
		case ProtoPaymentStatus.PAYMENT_STATUS_CANCELED:
			return EPaymentStatus.CANCELED;
		default:
			if (strict) throw createEnumError('PaymentStatus');
			return undefined;
	}
}

export function toProtoPaymentStatus(domain: EPaymentStatus | string): ProtoPaymentStatus {
	switch (domain as EPaymentStatus) {
		case EPaymentStatus.PENDING_PAYMENT_PROVIDER:
			return ProtoPaymentStatus.PAYMENT_STATUS_PENDING_PAYMENT_PROVIDER;
		case EPaymentStatus.PENDING:
			return ProtoPaymentStatus.PAYMENT_STATUS_PENDING;
		case EPaymentStatus.PROCESSING:
			return ProtoPaymentStatus.PAYMENT_STATUS_PROCESSING;
		case EPaymentStatus.COMPLETED:
			return ProtoPaymentStatus.PAYMENT_STATUS_COMPLETED;
		case EPaymentStatus.FAILED:
			return ProtoPaymentStatus.PAYMENT_STATUS_FAILED;
		case EPaymentStatus.PARTIALLY_REFUNDED:
			return ProtoPaymentStatus.PAYMENT_STATUS_PARTIALLY_REFUNDED;
		case EPaymentStatus.REFUNDED:
			return ProtoPaymentStatus.PAYMENT_STATUS_REFUNDED;
		case EPaymentStatus.CANCELED:
			return ProtoPaymentStatus.PAYMENT_STATUS_CANCELED;
		default:
			return ProtoPaymentStatus.PAYMENT_STATUS_UNSPECIFIED;
	}
}

// ============================================================================
// TransactionType
// ============================================================================

export function toDomainTransactionType(
	proto: ProtoTransactionType | undefined,
	strict = false
): EPaymentTransactionType | undefined {
	switch (proto) {
		case ProtoTransactionType.TRANSACTION_TYPE_CREATE:
			return EPaymentTransactionType.CREATE;
		case ProtoTransactionType.TRANSACTION_TYPE_AUTHORIZATION:
			return EPaymentTransactionType.AUTHORIZATION;
		case ProtoTransactionType.TRANSACTION_TYPE_CAPTURE:
			return EPaymentTransactionType.CAPTURE;
		case ProtoTransactionType.TRANSACTION_TYPE_CANCEL:
			return EPaymentTransactionType.CANCEL;
		case ProtoTransactionType.TRANSACTION_TYPE_REFUND:
			return EPaymentTransactionType.REFUND;
		default:
			if (strict) throw createEnumError('TransactionType');
			return undefined;
	}
}

export function toProtoTransactionType(
	domain: EPaymentTransactionType | string
): ProtoTransactionType {
	switch (domain as EPaymentTransactionType) {
		case EPaymentTransactionType.CREATE:
			return ProtoTransactionType.TRANSACTION_TYPE_CREATE;
		case EPaymentTransactionType.AUTHORIZATION:
			return ProtoTransactionType.TRANSACTION_TYPE_AUTHORIZATION;
		case EPaymentTransactionType.CAPTURE:
			return ProtoTransactionType.TRANSACTION_TYPE_CAPTURE;
		case EPaymentTransactionType.CANCEL:
			return ProtoTransactionType.TRANSACTION_TYPE_CANCEL;
		case EPaymentTransactionType.REFUND:
			return ProtoTransactionType.TRANSACTION_TYPE_REFUND;
		default:
			return ProtoTransactionType.TRANSACTION_TYPE_UNSPECIFIED;
	}
}

// ============================================================================
// PaymentMethod
// ============================================================================

export function toDomainPaymentMethod(
	proto: ProtoPaymentMethod | undefined,
	strict = false
): EPaymentMethod | undefined {
	switch (proto) {
		case ProtoPaymentMethod.PAYMENT_METHOD_CREDIT_CARD:
			return EPaymentMethod.CREDIT_CARD;
		case ProtoPaymentMethod.PAYMENT_METHOD_DEBIT_CARD:
			return EPaymentMethod.DEBIT_CARD;
		case ProtoPaymentMethod.PAYMENT_METHOD_QR_CODE:
			return EPaymentMethod.QR_CODE;
		default:
			if (strict) throw createEnumError('PaymentMethod');
			return undefined;
	}
}

export function toProtoPaymentMethod(domain: EPaymentMethod | string): ProtoPaymentMethod {
	switch (domain as EPaymentMethod) {
		case EPaymentMethod.CREDIT_CARD:
			return ProtoPaymentMethod.PAYMENT_METHOD_CREDIT_CARD;
		case EPaymentMethod.DEBIT_CARD:
			return ProtoPaymentMethod.PAYMENT_METHOD_DEBIT_CARD;
		case EPaymentMethod.QR_CODE:
			return ProtoPaymentMethod.PAYMENT_METHOD_QR_CODE;
		default:
			return ProtoPaymentMethod.PAYMENT_METHOD_UNSPECIFIED;
	}
}
