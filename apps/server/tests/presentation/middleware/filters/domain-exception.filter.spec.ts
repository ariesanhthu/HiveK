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
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404, message: 'User not found' }));
  });

  it('should return 409 for ConflictDomainException', () => {
    filter.catch(new ConflictDomainException('Email already exists'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
  });

  it('should return 403 for ForbiddenDomainException', () => {
    filter.catch(new ForbiddenDomainException('Access denied'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });

  it('should return 401 for UnauthorizedDomainException', () => {
    filter.catch(new UnauthorizedDomainException('Invalid token'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it('should return 400 for BadRequestDomainException', () => {
    filter.catch(new BadRequestDomainException('Invalid input'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for generic DomainException subclass', () => {
    // Using an anonymous subclass to test the default branch
    class CustomDomainException extends DomainException {
      constructor(msg: string) { super(msg); }
    }
    filter.catch(new CustomDomainException('Something generic'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('should include error name in response', () => {
    filter.catch(new NotFoundDomainException('test'), mockHost);
    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(jsonArg.error).toBe('NotFoundDomainException');
    expect(jsonArg.timestamp).toBeDefined();
  });
});