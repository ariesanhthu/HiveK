import type { UnknownRecord } from '@/shared/types';

/**
 * Read-only repository interface.
 * Used by external repositories (gRPC) that only fetch data.
 */
export interface IReadRepository<T> {
	findById(id: string): Promise<T | null>;
	findByIds(ids: string[]): Promise<T[]>;
	exists(id: string): Promise<boolean>;
}

/**
 * Write repository interface.
 * Used for create, update, delete operations.
 */
export interface IWriteRepository<T> {
	create(entity: T): Promise<T>;
	save(entity: T): Promise<T>;
	delete(id: string): Promise<void>;
}

/**
 * Full repository interface combining read and write operations.
 * Used by internal repositories (MongoDB) with full CRUD access.
 */
export interface IRepository<T> extends IReadRepository<T>, IWriteRepository<T> {
	findMany(filter: UnknownRecord): Promise<T[]>;
}
