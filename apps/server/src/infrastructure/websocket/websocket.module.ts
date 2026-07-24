import { WEBSOCKET_SERVICE } from '@/application/interfaces';
import { WebSocketGateway } from '@/presentation/controllers';
import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth.module';
import { WebSocketService } from './websocket.service';

@Global()
@Module({
  imports: [AuthModule],
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
