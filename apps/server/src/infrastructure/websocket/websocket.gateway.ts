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
import { Logger } from '@nestjs/common';

@NestWebSocketGateway({
  cors: { origin: '*' },
  namespace: 'hivek',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebSocketGateway.name);

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Temporary way to associate a socket with a user ID for testing.
   * In a real app, this would be handled via JWT extraction in handleConnection.
   */
  @SubscribeMessage('join_user')
  handleJoinUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    if (data.userId) {
      const room = `user_${data.userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined user room: ${room}`);
      return { status: 'joined', room };
    }
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Received ping from ${client.id}: ${JSON.stringify(data)}`);
    return { event: 'pong', data };
  }
}
