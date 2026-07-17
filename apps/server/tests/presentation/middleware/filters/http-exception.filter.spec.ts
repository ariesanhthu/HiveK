import { HttpExceptionFilter } from '@/presentation/middleware/filters/http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createMockLoggerService } from '../../../__mocks__/mock-services';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;
  let mockLogger: ReturnType<typeof createMockLoggerService>;

  beforeEach(() => {
    mockLogger = createMockLoggerService();
    filter = new HttpExceptionFilter(mockLogger as any);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test-path',
      method: 'GET',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should handle HttpException with correct status and response', () => {
    const exception = new HttpException({ message: 'Not found' }, HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Not found',
        }),
      }),
    );
  });

  it('should handle non-HttpException with 500 status', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Unexpected error',
        }),
      }),
    );
  });

  it('should handle string message from HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Forbidden',
        }),
      }),
    );
  });

  it('should handle 400 Bad Request with validation errors', () => {
    const exception = new HttpException(
      { message: ['email must be a valid email', 'password too short'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(jsonArg.success).toBe(false);
    expect(jsonArg.error.code).toBe('BAD_REQUEST');
    expect(jsonArg.error.message).toBe('email must be a valid email,password too short');
  });
});
