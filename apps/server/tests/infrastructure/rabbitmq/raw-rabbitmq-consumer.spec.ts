import { RawRabbitMQConsumerClient } from '@/infrastructure/rabbitmq/raw-rabbitmq-consumer';
import { RmqHandlerRegistry } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import * as amqp from 'amqplib';
import { createMockLoggerService } from '../../__mocks__/mock-services';

jest.mock('amqplib');
jest.mock('@/infrastructure/rabbitmq/rmq-consumer.registry');

describe('RawRabbitMQConsumerClient', () => {
  let client: RawRabbitMQConsumerClient;
  let mockLogger: any;
  let mockConnection: any;
  let mockChannel: any;

  const mockConfig: any = {
    connection: {
      uri: 'amqp://localhost',
      vhost: '/',
      reconnect: { max_retries: 1, initial_delay_ms: 10, factor: 1, max_delay_ms: 10 },
    },
    queues: [
      {
        name: 'test_queue',
        type: 'standard',
        options: { durable: true },
        bindings: [{ exchange: 'ex', routing_key: 'rk' }],
      },
    ],
    consume: { prefetch_count: 10, no_ack: false, manual_ack: true, requeue_on_error: false },
  };

  beforeEach(() => {
    mockLogger = createMockLoggerService();
    mockChannel = {
      on: jest.fn(),
      prefetch: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),
      consume: jest.fn().mockResolvedValue({}),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue({}),
    };
    mockConnection = {
      on: jest.fn(),
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue({}),
    };
    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    (RmqHandlerRegistry.getHandlersForQueue as jest.Mock).mockReturnValue([
      { pattern: 'rk', callback: jest.fn(), target: {}, methodName: 'handle' },
    ]);

    client = new RawRabbitMQConsumerClient(mockConfig, mockLogger);
  });

  describe('connect', () => {
    it('should connect and setup topology', async () => {
      await client.connect();

      expect(amqp.connect).toHaveBeenCalled();
      expect(mockChannel.prefetch).toHaveBeenCalledWith(10);
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('test_queue', expect.anything());
      expect(mockChannel.bindQueue).toHaveBeenCalledWith('test_queue', 'ex', 'rk');
      expect(mockChannel.consume).toHaveBeenCalled();
    });
  });

  describe('handleMessage', () => {
    it('should route message to handler and ack', async () => {
      await client.connect();
      const consumeCallback = mockChannel.consume.mock.calls[0][1];

      const mockMsg = {
        content: Buffer.from(JSON.stringify({ data: 'hello' })),
        fields: { routingKey: 'rk' },
      };

      await consumeCallback(mockMsg);

      const handlers = RmqHandlerRegistry.getHandlersForQueue('test_queue');
      expect(handlers[0].callback).toHaveBeenCalledWith('hello', mockMsg);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });

    it('should nack on error', async () => {
      await client.connect();
      const consumeCallback = mockChannel.consume.mock.calls[0][1];

      const mockMsg = {
        content: Buffer.from('invalid json'),
        fields: { routingKey: 'rk' },
      };

      await consumeCallback(mockMsg);
      expect(mockChannel.nack).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should close connection', async () => {
      await client.connect();
      await client.disconnect();
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});
