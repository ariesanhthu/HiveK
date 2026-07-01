import { type IReadRepository } from '@/core/interfaces';
import { type ExternalUserEntity } from '@/core/entities';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * Repository interface for User entity from external auth service.
 * Extends IReadRepository only - no write operations allowed.
 */
export interface IUserRepository extends IReadRepository<ExternalUserEntity> {
	// Domain-specific read methods can be added here
	findByEmail?(email: string): Promise<ExternalUserEntity | null>;
}
