import { Model } from 'mongoose';
import { MongoOtpRepository } from '@/infrastructure/mongo/repositories/otp.repository';
import { EOtpType } from '@/core/enums';

describe('MongoOtpRepository', () => {
  let repo: MongoOtpRepository;
  let mockModel: any;
  let mockUow: any;

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findOne = jest.fn().mockReturnThis();
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
      const saveMock = jest.fn().mockResolvedValue({});
      mockModel.mockImplementation(() => ({ save: saveMock }));

      const expiresAt = new Date();
      await repo.save('test@test.com', '123456', EOtpType.SIGN_UP, expiresAt);

      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findValidOtp', () => {
    it('should find valid otp', async () => {
      const mockOtp = { email: 'test@test.com', code: '123456' };
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(mockOtp);

      const result = await repo.findValidOtp('test@test.com', '123456', EOtpType.SIGN_UP);

      expect(mockModel.findOne).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@test.com',
        code: '123456',
        type: EOtpType.SIGN_UP,
      }));
      expect(result).toEqual(mockOtp);
    });
  });

  describe('deleteByEmailAndType', () => {
    it('should delete otps', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.deleteByEmailAndType('test@test.com', EOtpType.SIGN_UP);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        email: 'test@test.com',
        type: EOtpType.SIGN_UP,
      });
    });
  });

  describe('findRecentOtp', () => {
    it('should find recent otp', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.findRecentOtp('test@test.com', EOtpType.SIGN_UP, 60);
      expect(mockModel.findOne).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@test.com',
        type: EOtpType.SIGN_UP,
      }));
    });
  });
});
