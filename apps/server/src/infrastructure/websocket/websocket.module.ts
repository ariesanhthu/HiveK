import { Global, Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WEBSOCKET_SERVICE } from '@/application/interfaces';

@Global()
@Module({
  providers: [
    WebSocketGateway,
    {
      provide: WEBSOCKET_SERVICE,
      useClass: WebSocketService,
    },
  ],
  exports: [WEBSOCKET_SERVICE],
})
export class WebSocketModule {}
