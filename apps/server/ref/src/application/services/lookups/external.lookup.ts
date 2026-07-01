import { Injectable, Inject } from '@nestjs/common';
import {
	ENTERPRISE_REPOSITORY,
	type IEnterpriseRepository,
	type ExternalEnterpriseEntity,
} from '@/core';
import { USER_REPOSITORY, type IUserRepository, type ExternalUserEntity } from '@/core';

/**
 * Lookup service for external entities (Enterprise, User).
 *
 * NOTE: External lookups do NOT support session/transaction because
 * they use gRPC calls to external services.
 *
 * Usage pattern:
 * 1. Validate external entities BEFORE starting a transaction
 * 2. Then start transaction for internal entities
 */
@Injectable()
export class ExternalLookup {
	constructor(
		@Inject(ENTERPRISE_REPOSITORY)
		private readonly enterpriseRepository: IEnterpriseRepository,
		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository
	) {}

	// --- Enterprise Lookups ---

	async findEnterprise(id: string): Promise<ExternalEnterpriseEntity | null> {
		return this.enterpriseRepository.findById(id);
	}

	async findEnterprises(ids: string[]): Promise<ExternalEnterpriseEntity[]> {
		return this.enterpriseRepository.findByIds(ids);
	}

	async enterpriseExists(id: string): Promise<boolean> {
		return this.enterpriseRepository.exists(id);
	}

	// --- User Lookups ---

	async findUser(id: string): Promise<ExternalUserEntity | null> {
		return this.userRepository.findById(id);
	}

	async findUsers(ids: string[]): Promise<ExternalUserEntity[]> {
		return this.userRepository.findByIds(ids);
	}

	async userExists(id: string): Promise<boolean> {
		return this.userRepository.exists(id);
	}

	async findUserByEmail(email: string): Promise<ExternalUserEntity | null> {
		return this.userRepository.findByEmail?.(email) ?? null;
	}
}
