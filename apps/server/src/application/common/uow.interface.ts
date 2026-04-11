export interface IUnitOfWorkSession {
	commit(): Promise<void>;
	rollback(): Promise<void>;
	end(): Promise<void>;
}

export interface IUnitOfWork {
	start(): Promise<IUnitOfWorkSession>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
