import type {
	IAuditRepository,
	IPaymentRepository,
	IPaymentProviderRepository,
	IPackageRepository,
	ISubscriptionHistoryRepository,
	ISubscriptionRepository,
	IWalletRepository,
	IWalletTransactionRepository,
	IBillRepository,
	IOutboxRepository,
} from '@/core';

export interface IUnitOfWorkSession {
	paymentRepository: IPaymentRepository;
	providerRepository: IPaymentProviderRepository;
	auditRepository: IAuditRepository;
	packageRepository: IPackageRepository;
	subscriptionRepository: ISubscriptionRepository;
	walletRepository: IWalletRepository;
	walletTransactionRepository: IWalletTransactionRepository;
	subscriptionHistoryRepository: ISubscriptionHistoryRepository;
	billRepository: IBillRepository;
	outboxRepository: IOutboxRepository;

	commit(): Promise<void>;
	rollback(): Promise<void>;
	end(): Promise<void>;
}

export interface IUnitOfWork {
	start(): Promise<IUnitOfWorkSession>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
