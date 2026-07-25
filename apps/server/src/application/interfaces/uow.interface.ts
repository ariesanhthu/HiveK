import type { ClientSession } from 'mongoose';

export interface IUnitOfWork {
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getSession?(): ClientSession | undefined;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
