import { type IReadRepository } from '@/core/interfaces';
import { type ExternalEnterpriseEntity } from '@/core/entities';

export const ENTERPRISE_REPOSITORY = Symbol('ENTERPRISE_REPOSITORY');

/**
 * Repository interface for Enterprise entity from external service.
 * Extends IReadRepository only - no write operations allowed.
 */
export interface IEnterpriseRepository extends IReadRepository<ExternalEnterpriseEntity> {
	// Domain-specific read methods can be added here
	findByName?(name: string): Promise<ExternalEnterpriseEntity | null>;
}
