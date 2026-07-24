import { NestLoggerService } from '@/infrastructure/logger/nest-logger.service';

describe('NestLoggerService', () => {
  let logger: NestLoggerService;

  beforeEach(() => {
    logger = new NestLoggerService('TestContext');
  });

  it('should log messages', () => {
    expect(() => logger.log('test message')).not.toThrow();
  });

  it('should log messages with context', () => {
    expect(() => logger.log('test message', 'CustomContext')).not.toThrow();
  });

  it('should log errors', () => {
    expect(() => logger.error('error message')).not.toThrow();
  });

  it('should log errors with trace', () => {
    expect(() => logger.error('error message', 'stack trace')).not.toThrow();
  });

  it('should log warnings', () => {
    expect(() => logger.warn('warning message')).not.toThrow();
  });

  it('should log warnings with context', () => {
    expect(() => logger.warn('warning message', 'Context')).not.toThrow();
  });

  it('should log debug messages', () => {
    expect(() => logger.debug('debug message')).not.toThrow();
  });

  it('should log verbose messages', () => {
    expect(() => logger.verbose('verbose message')).not.toThrow();
  });

  it('should set context', () => {
    expect(() => logger.setContext('NewContext')).not.toThrow();
  });
});
