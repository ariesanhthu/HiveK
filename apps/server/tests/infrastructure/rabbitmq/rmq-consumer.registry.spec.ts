import {
  RmqHandlerMetadata,
  RmqHandlerRegistry,
} from '@/infrastructure/rabbitmq/rmq-consumer.registry';

describe('RmqHandlerRegistry', () => {
  beforeEach(() => {
    // Clear registry between tests by reaching into static property
    const registry = RmqHandlerRegistry as any;
    registry.handlers = [];
  });

  describe('register', () => {
    it('should register a handler', () => {
      const metadata: RmqHandlerMetadata = {
        queue: 'campaign_queue',
        pattern: 'campaign.created',
        target: {},
        methodName: 'handleCampaignCreated',
        callback: jest.fn(),
      };

      RmqHandlerRegistry.register(metadata);

      expect(RmqHandlerRegistry.getAllHandlers()).toHaveLength(1);
    });

    it('should register multiple handlers', () => {
      RmqHandlerRegistry.register({
        queue: 'q1',
        pattern: 'p1',
        target: {},
        methodName: 'h1',
        callback: jest.fn(),
      });
      RmqHandlerRegistry.register({
        queue: 'q2',
        pattern: 'p2',
        target: {},
        methodName: 'h2',
        callback: jest.fn(),
      });
      RmqHandlerRegistry.register({
        queue: 'q1',
        pattern: 'p3',
        target: {},
        methodName: 'h3',
        callback: jest.fn(),
      });

      expect(RmqHandlerRegistry.getAllHandlers()).toHaveLength(3);
    });
  });

  describe('getHandlersForQueue', () => {
    it('should return handlers matching queue name', () => {
      RmqHandlerRegistry.register({
        queue: 'campaign_queue',
        pattern: 'campaign.created',
        target: {},
        methodName: 'h1',
        callback: jest.fn(),
      });
      RmqHandlerRegistry.register({
        queue: 'campaign_queue',
        pattern: 'campaign.updated',
        target: {},
        methodName: 'h2',
        callback: jest.fn(),
      });
      RmqHandlerRegistry.register({
        queue: 'other_queue',
        pattern: 'other.event',
        target: {},
        methodName: 'h3',
        callback: jest.fn(),
      });

      const handlers = RmqHandlerRegistry.getHandlersForQueue('campaign_queue');
      expect(handlers).toHaveLength(2);
      expect(handlers[0].pattern).toBe('campaign.created');
      expect(handlers[1].pattern).toBe('campaign.updated');
    });

    it('should return empty array for unknown queue', () => {
      const handlers = RmqHandlerRegistry.getHandlersForQueue('nonexistent');
      expect(handlers).toHaveLength(0);
    });
  });

  describe('getAllHandlers', () => {
    it('should return all registered handlers', () => {
      expect(RmqHandlerRegistry.getAllHandlers()).toHaveLength(0);

      RmqHandlerRegistry.register({
        queue: 'q1',
        pattern: 'p1',
        target: {},
        methodName: 'h1',
        callback: jest.fn(),
      });
      expect(RmqHandlerRegistry.getAllHandlers()).toHaveLength(1);
    });
  });
});
