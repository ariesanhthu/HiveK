import { ExecutionContext } from '@nestjs/common';
import { GoogleAuthGuard } from '@/presentation/middleware/guards/google-auth.guard';

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  beforeEach(() => {
    guard = new GoogleAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getAuthenticateOptions', () => {
    it('should return state with type from query', () => {
      const mockRequest = {
        query: {
          type: 'enterprise',
        },
      };
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const options = guard.getAuthenticateOptions(mockExecutionContext);

      expect(options).toEqual({
        state: JSON.stringify({ type: 'enterprise' }),
      });
    });

    it('should default to kol type if type is missing from query', () => {
      const mockRequest = {
        query: {},
      };
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const options = guard.getAuthenticateOptions(mockExecutionContext);

      expect(options).toEqual({
        state: JSON.stringify({ type: 'kol' }),
      });
    });
  });
});
