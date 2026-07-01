import type { CaslSubject as LibraryCaslSubject } from '@sgod-casl/library';

/**
 * Subject constants cho payment-service.
 * Giá trị khớp union `CaslSubject` trong `@sgod-casl/library` và field `subject` trong permission JSON.
 */
export const CaslSubject = {
	PaymentProvider: 'PaymentProvider',
	Transaction: 'Transaction',
	/** Alias semantic — cùng resource `Transaction` trong catalog. */
	PaymentTransaction: 'Transaction',
	WalletTransaction: 'Transaction',
	Bill: 'Bill',
	Package: 'Package',
	Subscription: 'Subscription',
	SubscriptionHistory: 'Subscription',
	Wallet: 'Wallet',
	AuditLog: 'AuditLog',
	All: 'all',
} as const satisfies Record<string, LibraryCaslSubject>;

export type CaslSubjectValue = (typeof CaslSubject)[keyof typeof CaslSubject];
