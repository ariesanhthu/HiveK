import { RabbitMQService } from '@/infrastructure/rabbitmq/rabbitmq.service';
import { RawRabbitMQProducerClient } from '@/infrastructure/rabbitmq/raw-rabbitmq-producer';

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let mockProducer: any;
  let mockConfig: any;

  beforeEach(() => {
    mockProducer = {
      publish: jest.fn().mockResolvedValue(undefined),
      isHealthy: jest.fn().mockReturnValue(true),
    };
    mockConfig = {
      routes: {
        'campaign.created': 'campaign.created',
        'kol.profile.updated': 'kol.profile.updated',
      },
    };
    service = new RabbitMQService(mockProducer, mockConfig);
  });

  describe('emit', () => {
    it('should publish message with correct routing key', async () => {
      await service.emit('campaign.created', { campaignId: '123' });

      expect(mockProducer.publish).toHaveBeenCalledWith('campaign.created', { campaignId: '123' });
    });

    it('should use pattern as routing key when no route configured', async () => {
      await service.emit('unknown.event', { data: 'test' });

      expect(mockProducer.publish).toHaveBeenCalledWith('unknown.event', { data: 'test' });
    });

    it('should handle publish errors', async () => {
      mockProducer.publish.mockRejectedValue(new Error('Connection lost'));

      await expect(service.emit('campaign.created', {})).rejects.toThrow('Connection lost');
    });

    it('should handle non-Error rejections', async () => {
      mockProducer.publish.mockRejectedValue('String error');

      await expect(service.emit('campaign.created', {})).rejects.toBeDefined();
    });
  });

  describe('send', () => {
    it('should throw not supported error', async () => {
      await expect(service.send('pattern', {})).rejects.toThrow('RPC send() not supported');
    });
  });

  describe('isHealthy', () => {
    it('should return producer health status', () => {
      expect(service.isHealthy()).toBe(true);
      mockProducer.isHealthy.mockReturnValue(false);
      expect(service.isHealthy()).toBe(false);
    });
  });
});
