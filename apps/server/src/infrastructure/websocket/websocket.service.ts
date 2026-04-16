import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { IWebSocketService } from '@/application/interfaces';

@Injectable()
export class WebSocketService implements IWebSocketService {
  constructor(private readonly gateway: WebSocketGateway) {}

  emitToUser<T = any>(userId: string, event: string, data: T): void {
    const room = `user_${userId}`;
    this.gateway.server.to(room).emit(event, data);
  }

  broadcastToRoom<T = any>(room: string, event: string, data: T): void {
    this.gateway.server.to(room).emit(event, data);
  }

  broadcastAll<T = any>(event: string, data: T): void {
    this.gateway.server.emit(event, data);
  }
}
