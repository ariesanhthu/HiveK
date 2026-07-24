import { SendVerificationEmailRequestedEvent } from '@/application/events';
import { EventMapper } from '@/application/mappers/event.mapper';
import { EOtpType, ERoleType, TargetType } from '@/core/enums';
import {
  EntityHardDeletedEvent,
  UserSignedUpEvent,
  VerificationOtpCreatedEvent,
} from '@/core/events';

describe('EventMapper', () => {
  describe('mapToIntegrationEvents', () => {
    it('should map VerificationOtpCreatedEvent to SendVerificationEmailRequestedEvent', () => {
      const payload = {
        email: 'test@example.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const domainEvent = new VerificationOtpCreatedEvent('otp-1', payload);

      const integrationEvents = EventMapper.mapToIntegrationEvents([domainEvent]);

      expect(integrationEvents).toHaveLength(1);
      expect(integrationEvents[0]).toBeInstanceOf(SendVerificationEmailRequestedEvent);
      expect(integrationEvents[0].payload).toEqual(expect.objectContaining({
        email: 'test@example.com',
        otpCode: '123456',
        type: EOtpType.CREATE_ACCOUNT,
      }));
      expect(integrationEvents[0].transport).toEqual({
        exchange: 'kpi_exchange',
        routingKey: 'notification.verification_otp',
      });
    });

    it('should return empty array for UserSignedUpEvent (currently unmapped)', () => {
      const domainEvent = new UserSignedUpEvent('user-1', {
        email: 'test@example.com',
        type: ERoleType.KOL,
      });

      const integrationEvents = EventMapper.mapToIntegrationEvents([domainEvent]);

      expect(integrationEvents).toEqual([]);
    });

    it('should return empty array for EntityHardDeletedEvent (currently unmapped)', () => {
      const domainEvent = new EntityHardDeletedEvent('ent-1', {
        entityId: 'ent-1',
        targetType: TargetType.USER,
      });

      const integrationEvents = EventMapper.mapToIntegrationEvents([domainEvent]);

      expect(integrationEvents).toEqual([]);
    });

    it('should handle multiple mixed events', () => {
      const otpEvent = new VerificationOtpCreatedEvent('otp-1', { email: 't1@e.com' } as any);
      const userEvent = new UserSignedUpEvent('user-1', { email: 't2@e.com' } as any);

      const result = EventMapper.mapToIntegrationEvents([otpEvent, userEvent]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SendVerificationEmailRequestedEvent);
    });
  });
});
