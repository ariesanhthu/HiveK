import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseUnitOfWork } from '@sgod-mongodb/library/mongoose';
import {
	MongooseTransactionManager,
	TRANSACTION_MANAGER_TOKEN,
} from '@sgod-mongodb/library/nestjs';
import type { ClientSession, Model } from 'mongoose';
import {
	IUnitOfWork,
	IUnitOfWorkSession,
} from '@/core/interfaces/repositories/unit-of-work.interface';
import {
	MongoAuditRepository,
	MongoBillRepository,
	MongoOutboxRepository,
	MongoPackageRepository,
	MongoPaymentProviderRepository,
	MongoPaymentRepository,
	MongoSubscriptionHistoryRepository,
	MongoSubscriptionRepository,
	MongoWalletRepository,
	MongoWalletTransactionRepository,
} from '../repositories';
import {
	BillModel,
	type BillDocument,
	OutboxEventModel,
	type OutboxEventDocument,
	PackageModel,
	type PackageDocument,
	PaymentEventModel,
	type PaymentEventDocument,
	PaymentModel,
	type PaymentDocument,
	PaymentProviderModel,
	type PaymentProviderDocument,
	SubscriptionHistoryModel,
	type SubscriptionHistoryDocument,
	SubscriptionModel,
	type SubscriptionDocument,
	WalletModel,
	type WalletDocument,
	WalletTransactionModel,
	type WalletTransactionDocument,
} from '../schemas';

type PaymentMongoRepos = {
	paymentRepository: MongoPaymentRepository;
	providerRepository: MongoPaymentProviderRepository;
	auditRepository: MongoAuditRepository;
	packageRepository: MongoPackageRepository;
	subscriptionRepository: MongoSubscriptionRepository;
	walletRepository: MongoWalletRepository;
	walletTransactionRepository: MongoWalletTransactionRepository;
	subscriptionHistoryRepository: MongoSubscriptionHistoryRepository;
	billRepository: MongoBillRepository;
	outboxRepository: MongoOutboxRepository;
};

@Injectable()
export class MongoUnitOfWork implements IUnitOfWork {
	private readonly libraryUow: MongooseUnitOfWork<PaymentMongoRepos>;

	constructor(
		@Inject(TRANSACTION_MANAGER_TOKEN)
		transactionManager: MongooseTransactionManager,
		@InjectModel(PaymentModel.name) private readonly paymentModel: Model<PaymentDocument>,
		@InjectModel(PaymentProviderModel.name)
		private readonly providerModel: Model<PaymentProviderDocument>,
		@InjectModel(PaymentEventModel.name)
		private readonly eventModel: Model<PaymentEventDocument>,
		@InjectModel(PackageModel.name)
		private readonly packageModel: Model<PackageDocument>,
		@InjectModel(SubscriptionModel.name)
		private readonly subscriptionModel: Model<SubscriptionDocument>,
		@InjectModel(WalletModel.name) private readonly walletModel: Model<WalletDocument>,
		@InjectModel(WalletTransactionModel.name)
		private readonly walletTransactionModel: Model<WalletTransactionDocument>,
		@InjectModel(SubscriptionHistoryModel.name)
		private readonly subscriptionHistoryModel: Model<SubscriptionHistoryDocument>,
		@InjectModel(BillModel.name) private readonly billModel: Model<BillDocument>,
		@InjectModel(OutboxEventModel.name) private readonly outboxModel: Model<OutboxEventDocument>
	) {
		this.libraryUow = new MongooseUnitOfWork(transactionManager, {
			createRepositories: (session: ClientSession) => this.createRepositories(session),
		});
	}

	async start(): Promise<IUnitOfWorkSession> {
		const handle = await this.libraryUow.start();
		const repos = handle.repos;
		return {
			paymentRepository: repos.paymentRepository,
			providerRepository: repos.providerRepository,
			auditRepository: repos.auditRepository,
			packageRepository: repos.packageRepository,
			subscriptionRepository: repos.subscriptionRepository,
			walletRepository: repos.walletRepository,
			walletTransactionRepository: repos.walletTransactionRepository,
			subscriptionHistoryRepository: repos.subscriptionHistoryRepository,
			billRepository: repos.billRepository,
			outboxRepository: repos.outboxRepository,
			commit: () => handle.commit(),
			rollback: () => handle.rollback(),
			end: () => handle.end(),
		};
	}

	private createRepositories(session: ClientSession): PaymentMongoRepos {
		return {
			paymentRepository: new MongoPaymentRepository(this.paymentModel, session),
			providerRepository: new MongoPaymentProviderRepository(this.providerModel, session),
			auditRepository: new MongoAuditRepository(this.eventModel, session),
			packageRepository: new MongoPackageRepository(this.packageModel, session),
			subscriptionRepository: new MongoSubscriptionRepository(
				this.subscriptionModel,
				session
			),
			walletRepository: new MongoWalletRepository(this.walletModel, session),
			walletTransactionRepository: new MongoWalletTransactionRepository(
				this.walletTransactionModel,
				session
			),
			subscriptionHistoryRepository: new MongoSubscriptionHistoryRepository(
				this.subscriptionHistoryModel,
				session
			),
			billRepository: new MongoBillRepository(this.billModel, session),
			outboxRepository: new MongoOutboxRepository(this.outboxModel, session),
		};
	}
}
