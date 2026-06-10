import { DomainExceptionFilter } from '@/presentation/middleware/filters/domain-exception.filter';
import { DomainException, NotFoundDomainException, ConflictDomainException, ForbiddenDomainException, UnauthorizedDomainException, BadRequestDomainException } from '@/core/common/exceptions/domain.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should return 404 for NotFoundDomainException', () => {
    filter.catch(new NotFoundDomainException('User not found'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'User not found'
      })
    }));
  });

  it('should return 409 for ConflictDomainException', () => {
    filter.catch(new ConflictDomainException('Email already exists'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'CONFLICT',
      })
    }));
  });

  it('should return 403 for ForbiddenDomainException', () => {
    filter.catch(new ForbiddenDomainException('Access denied'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'FORBIDDEN',
      })
    }));
  });

  it('should return 401 for UnauthorizedDomainException', () => {
    filter.catch(new UnauthorizedDomainException('Invalid token'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'UNAUTHORIZED',
      })
    }));
  });

  it('should return 400 for BadRequestDomainException', () => {
    filter.catch(new BadRequestDomainException('Invalid input'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'BAD_REQUEST',
      })
    }));
  });
});
