import { MongoOtpRepository } from '@/infrastructure/mongo/repositories/otp.repository';
import { EOtpType } from '@/core/enums';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';

describe('MongoOtpRepository', () => {
  let repo: MongoOtpRepository;
  let mockModel: any;
  let mockUow: any;

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findOneAndUpdate = jest.fn().mockReturnThis();
    mockModel.deleteMany = jest.fn().mockReturnThis();
    mockModel.session = jest.fn().mockReturnThis();
    mockModel.lean = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    mockUow = {
      getSession: jest.fn().mockReturnValue(null),
    };

    repo = new MongoOtpRepository(mockModel as any, mockUow);
  });

  describe('save', () => {
    it('should save otp', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});

      const expiresAt = new Date();
      const otp = OtpRoot.create({
        email: 'test@test.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
        expiresAt,
      });

      await repo.save(otp);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: otp.id },
        {
          $set: {
            email: 'test@test.com',
            code: '123456',
            type: EOtpType.CREATE_ACCOUNT,
            expired_at: expiresAt,
          },
        },
        expect.any(Object)
      );
    });
  });

  describe('findValidOtp', () => {
    it('should find valid otp', async () => {
      const mockOtpDoc = {
        _id: 'otp-id',
        email: 'test@test.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
        expired_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(mockOtpDoc);

      const result = await repo.findValidOtp('test@test.com', '123456', EOtpType.CREATE_ACCOUNT);

      expect(mockModel.findOne).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@test.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
      }));
      expect(result).toBeInstanceOf(OtpRoot);
      expect(result?.email).toBe('test@test.com');
      expect(result?.code).toBe('123456');
    });
  });

  describe('deleteByEmailAndType', () => {
    it('should delete otps', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.deleteByEmailAndType('test@test.com', EOtpType.CREATE_ACCOUNT);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        email: 'test@test.com',
        type: EOtpType.CREATE_ACCOUNT,
      });
    });
  });

  describe('findRecentOtp', () => {
    it('should find recent otp', async () => {
      const mockOtpDoc = {
        _id: 'otp-id',
        email: 'test@test.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
        expired_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(mockOtpDoc);

      const result = await repo.findRecentOtp('test@test.com', EOtpType.CREATE_ACCOUNT, 60);

      expect(mockModel.findOne).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@test.com',
        type: EOtpType.CREATE_ACCOUNT,
      }));
      expect(result).toBeInstanceOf(OtpRoot);
    });
  });
});
