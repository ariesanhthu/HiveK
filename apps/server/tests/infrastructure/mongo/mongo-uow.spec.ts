import { MongoUnitOfWork } from '@/infrastructure/mongo/mongo-uow';

describe('MongoUnitOfWork', () => {
  let uow: MongoUnitOfWork;
  let mockSession: any;
  let mockConnection: any;

  beforeEach(() => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mockConnection = {
      startSession: jest.fn().mockResolvedValue(mockSession),
    };
    uow = new MongoUnitOfWork(mockConnection);
  });

  describe('startTransaction', () => {
    it('should start a new session and transaction', async () => {
      await uow.startTransaction();

      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(uow.getSession()).toBe(mockSession);
    });
  });

  describe('commitTransaction', () => {
    it('should commit and end session', async () => {
      await uow.startTransaction();
      await uow.commitTransaction();

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(uow.getSession()).toBeNull();
    });

    it('should do nothing when no active session', async () => {
      await uow.commitTransaction();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('rollbackTransaction', () => {
    it('should abort and end session', async () => {
      await uow.startTransaction();
      await uow.rollbackTransaction();

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(uow.getSession()).toBeNull();
    });

    it('should do nothing when no active session', async () => {
      await uow.rollbackTransaction();
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('should run operation within transaction and commit', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await uow.execute(operation);

      expect(result).toBe('result');
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should rollback on operation failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(uow.execute(operation)).rejects.toThrow('Operation failed');
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should return null before transaction starts', () => {
      expect(uow.getSession()).toBeNull();
    });

    it('should return session after startTransaction', async () => {
      await uow.startTransaction();
      expect(uow.getSession()).toBe(mockSession);
    });
  });
});