import { Test, TestingModule } from '@nestjs/testing';
import { MailerService as NestMailService } from '@nestjs-modules/mailer';
import { NestjsMailerService } from '@/infrastructure/mailer/nestjs-mailer.service';
import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';

describe('NestjsMailerService', () => {
  let service: NestjsMailerService;
  let mockNestMailerService: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockNestMailerService = {
      sendMail: jest.fn().mockResolvedValue({}),
    };

    mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestjsMailerService,
        {
          provide: NestMailService,
          useValue: mockNestMailerService,
        },
        {
          provide: LOGGER_SERVICE,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<NestjsMailerService>(NestjsMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call sendMail with correct parameters', async () => {
    const options = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test Html</p>',
    };

    await service.sendMail(options);

    expect(mockNestMailerService.sendMail).toHaveBeenCalledWith({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      from: undefined,
      cc: undefined,
      bcc: undefined,
      attachments: undefined,
    });
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Sending email to test@example.com with subject "Test Subject"...`,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `✓ Email sent successfully to test@example.com`,
    );
  });

  it('should support templates and context', async () => {
    const options = {
      to: 'test@example.com',
      subject: 'Test Template',
      template: 'test',
      context: { name: 'Alice' },
    };

    await service.sendMail(options);

    expect(mockNestMailerService.sendMail).toHaveBeenCalledWith({
      to: options.to,
      subject: options.subject,
      template: 'test',
      context: { name: 'Alice' },
      text: undefined,
      html: undefined,
      from: undefined,
      cc: undefined,
      bcc: undefined,
      attachments: undefined,
    });
  });

  it('should log and throw error when sendMail fails', async () => {
    const options = {
      to: 'test@example.com',
      subject: 'Fail Subject',
      text: 'Fail Text',
    };

    const error = new Error('SMTP Error');
    mockNestMailerService.sendMail.mockRejectedValue(error);

    await expect(service.sendMail(options)).rejects.toThrow('SMTP Error');

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to send email to test@example.com: SMTP Error`,
      error.stack,
    );
  });
});
