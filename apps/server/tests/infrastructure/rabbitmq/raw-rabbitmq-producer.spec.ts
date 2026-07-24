import { RawRabbitMQProducerClient } from '@/infrastructure/rabbitmq/raw-rabbitmq-producer';
import * as amqp from 'amqplib';
import { createMockLoggerService } from '../../__mocks__/mock-services';

jest.mock('amqplib');

describe('RawRabbitMQProducerClient', () => {
  let client: RawRabbitMQProducerClient;
  let mockLogger: any;
  let mockConnection: any;
  let mockChannel: any;

  const mockConfig: any = {
    connection: {
      uri: 'amqp://localhost',
      vhost: '/',
      reconnect: {
        max_retries: 5,
        initial_delay_ms: 10,
        factor: 2,
        max_delay_ms: 100,
      },
    },
    exchange_contract: {
      name: 'test_exchange',
      type: 'topic',
      options: { durable: true, internal: false, autoDelete: false },
    },
    publish: {
      persistent: true,
      mandatory: false,
      delivery_mode: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLoggerService();
    mockChannel = {
      on: jest.fn(),
      assertExchange: jest.fn().mockResolvedValue({}),
      publish: jest.fn().mockImplementation((ex, rk, buf, opts, cb) => cb(null, true)),
      close: jest.fn().mockResolvedValue({}),
    };
    mockConnection = {
      on: jest.fn(),
      createConfirmChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue({}),
    };
    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    client = new RawRabbitMQProducerClient(mockConfig, mockLogger);
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await client.connect();

      expect(amqp.connect).toHaveBeenCalledWith(mockConfig.connection.uri);
      expect(mockConnection.createConfirmChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        mockConfig.exchange_contract.name,
        mockConfig.exchange_contract.type,
        expect.anything(),
      );
      expect(client.isHealthy()).toBe(true);
    });

    it('should not reconnect if already connected', async () => {
      await client.connect();
      expect(amqp.connect).toHaveBeenCalledTimes(1);

      await client.connect();
      expect(amqp.connect).toHaveBeenCalledTimes(1);
    });

    it('should log error if connection fails', async () => {
      (amqp.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
      // Mock sleep to return immediately
      (client as any).sleep = jest.fn().mockResolvedValue({});

      // We don't want to enter infinite retry loop in test
      const originalRetries = mockConfig.connection.reconnect.max_retries;
      mockConfig.connection.reconnect.max_retries = 1;

      await client.connect();
      expect(mockLogger.error).toHaveBeenCalled();
      expect(client.isHealthy()).toBe(false);

      mockConfig.connection.reconnect.max_retries = originalRetries;
    });
  });

  describe('publish', () => {
    it('should publish message', async () => {
      await client.connect();
      await client.publish('test.key', { foo: 'bar' });

      expect(mockChannel.publish).toHaveBeenCalledWith(
        mockConfig.exchange_contract.name,
        'test.key',
        expect.any(Buffer),
        expect.anything(),
        expect.any(Function),
      );
    });

    it('should throw error if channel not available even after reconnection attempt', async () => {
      (amqp.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      (client as any).sleep = jest.fn().mockResolvedValue({});
      mockConfig.connection.reconnect.max_retries = 0;

      await expect(client.publish('test.key', {})).rejects.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should close connection and channel', async () => {
      await client.connect();
      await client.disconnect();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
      expect(client.isHealthy()).toBe(false);
    });
  });
});
