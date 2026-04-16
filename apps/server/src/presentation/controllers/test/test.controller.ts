import { Controller, Get, Inject, Logger, Query } from '@nestjs/common';
import { type IMessageQueueService, type IWebSocketService, MESSAGE_QUEUE_SERVICE, WEBSOCKET_SERVICE } from '@/application/interfaces';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    @Inject(MESSAGE_QUEUE_SERVICE) private readonly mqService: IMessageQueueService,
    @Inject(WEBSOCKET_SERVICE) private readonly wsService: IWebSocketService,
  ) {}

  /**
   * HTTP Endpoint to trigger a message emission.
   * GET /hivek/api/test/emit-mq
   */
  @Get('emit-mq')
  testEmitMq() {
    this.logger.log('Emitting test event via RabbitMQ...');
    const payload = { message: 'Hello RabbitMQ', timestamp: new Date() };
    
    this.mqService.emit('test_event', payload);
    this.mqService.emit('default', payload);
    return { status: 'MQ Event emitted!' };
  }

  /**
   * HTTP Endpoint to trigger an RPC call.
   * GET /hivek/api/test/send-mq
   */
  @Get('send-mq')
  async testSendMq() {
    this.logger.log('Sending test RPC request via RabbitMQ...');
    const result = await this.mqService.send('test_rpc', { query: 'Ping' });
    return { status: 'MQ RPC call finished!', result };
  }

  /**
   * HTTP Endpoint to trigger a WebSocket broadcast.
   * GET /hivek/api/test/broadcast-ws
   */
  @Get('broadcast-ws')
  testBroadcastWs(@Query('msg') msg: string = 'Hello World') {
    this.logger.log('Broadcasting message via WebSocket...');
    this.wsService.broadcastAll('test_broadcast', { message: msg, timestamp: new Date() });
    return { status: 'WS Broadcast sent!' };
  }

  /**
   * HTTP Endpoint to trigger a WebSocket message to a specific user.
   * GET /hivek/api/test/emit-user-ws?userId=123
   */
  @Get('emit-user-ws')
  testEmitUserWs(@Query('userId') userId: string, @Query('msg') msg: string = 'Hello User') {
    if (!userId) return { error: 'userId is required' };
    this.logger.log(`Emitting message to user ${userId} via WebSocket...`);
    this.wsService.emitToUser(userId, 'test_user_event', { message: msg, timestamp: new Date() });
    return { status: `WS Message sent to user ${userId}!` };
  }
}
