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

  describe('execute', () => {
    it('should run operation within transaction and commit', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await uow.execute(operation);

      expect(result).toBe('result');
      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should rollback on operation failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(uow.execute(operation)).rejects.toThrow('Operation failed');
      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should reuse existing session for nested execute calls', async () => {
      const innerOperation = jest.fn().mockResolvedValue('inner');
      const outerOperation = jest.fn().mockImplementation(async () => {
        return await uow.execute(innerOperation);
      });

      const result = await uow.execute(outerOperation);

      expect(result).toBe('inner');
      // Should only start session once
      expect(mockConnection.startSession).toHaveBeenCalledTimes(1);
      expect(outerOperation).toHaveBeenCalled();
      expect(innerOperation).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should return null before transaction starts', () => {
      expect(uow.getSession()).toBeNull();
    });

    it('should return session during execute', async () => {
      await uow.execute(async () => {
        expect(uow.getSession()).toBe(mockSession);
      });
    });
  });

  describe('manual transaction methods (deprecated)', () => {
    it('startTransaction should throw error', async () => {
      await expect(uow.startTransaction()).rejects.toThrow('Use execute() instead');
    });

    it('commitTransaction should throw error', async () => {
      await expect(uow.commitTransaction()).rejects.toThrow('Use execute() instead');
    });

    it('rollbackTransaction should throw error', async () => {
      await expect(uow.rollbackTransaction()).rejects.toThrow('Use execute() instead');
    });
  });
});