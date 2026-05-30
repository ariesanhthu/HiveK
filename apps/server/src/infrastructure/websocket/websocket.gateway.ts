import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { AUTH_JWT_SERVICE } from '@/application/interfaces/auth-jwt.interface';
import type { IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';
import type { ILoggerService } from '@/application/interfaces/logger.interface';

@NestWebSocketGateway({
  cors: { origin: '*' },
  namespace: 'hivek',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    this.logger.setContext(WebSocketGateway.name);
  }

  async handleConnection(client: Socket) {
    let token = client.handshake.auth?.token || client.handshake.query?.token;

    // Check Authorization header if available
    const authHeader = client.handshake.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      this.logger.warn(`Connection rejected: No token provided (Client: ${client.id})`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      if (!userId) {
        throw new Error('No user ID found in token payload');
      }

      const room = `user_${userId}`;
      await client.join(room);
      this.logger.log(`Client ${client.id} authenticated and joined user room: ${room}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Connection rejected: Invalid token (Client: ${client.id}). Error: ${errorMsg}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Received ping from ${client.id}: ${JSON.stringify(data)}`);
    return { event: 'pong', data };
  }
}
