import { KolProfileUpdateCommand } from '@/application/commands/kol-profile-update/kol-profile-update.command';
import { UpdateKolProfileDto } from '@/application/commands/kol-profile-update/kol-profile-update.dto';
import { KolProfileDto } from '@/application/dtos/kol-profile.dto';
import {
  CursorPaginationRequestDto,
  PaginatedResponseDto,
} from '@/application/dtos/pagination.dto';
import {
  type IMessageQueueService,
  type IWebSocketService,
  MESSAGE_QUEUE_SERVICE,
  WEBSOCKET_SERVICE,
} from '@/application/interfaces';
import { KolProfileGetHandlesDevQuery } from '@/application/queries/kol-profile-get-handles-dev/kol-profile-get-handles-dev.query';
import { Public } from '@/presentation/decorators/public.decorator';
import { Body, Controller, Get, Inject, Logger, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('test')
@ApiSecurity('x-api-key')
@Public()
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
    this.wsService.broadcastAll('test_broadcast', {
      message: msg,
      timestamp: new Date(),
    });
    return { status: 'WS Broadcast sent!' };
  }

  /**
   * HTTP Endpoint to trigger a WebSocket message to a specific user.
   * GET /hivek/api/test/emit-user-ws?userId=123
   */
  @Get('emit-user-ws')
  testEmitUserWs(
    @Query('userId') userId: string,
    @Query('msg') msg: string = 'Hello User',
  ) {
    if (!userId) return { error: 'userId is required' };
    this.logger.log(`Emitting message to user ${userId} via WebSocket...`);
    this.wsService.emitToUser(userId, 'test_user_event', {
      message: msg,
      timestamp: new Date(),
    });
    return { status: `WS Message sent to user ${userId}!` };
  }
}

@ApiTags('test')
@Public()
@Controller('kol-profiles')
export class TestKOLController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Public()
  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(
    @Query() pagination: CursorPaginationRequestDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.queryBus.execute(new KolProfileGetHandlesDevQuery(pagination));
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update anything of an influencer (PATCH)' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateKolProfileDto,
  ): Promise<KolProfileDto> {
    return this.commandBus.execute(new KolProfileUpdateCommand(id, input));
  }
}
