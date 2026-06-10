import { WebSocketService } from '@/infrastructure/websocket/websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockGateway: any;

  beforeEach(() => {
    mockGateway = {
      server: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
    };
    service = new WebSocketService(mockGateway);
  });

  describe('emitToUser', () => {
    it('should emit to user room', () => {
      service.emitToUser('user-123', 'notification', { title: 'Hello' });

      expect(mockGateway.server.to).toHaveBeenCalledWith('user_user-123');
      expect(mockGateway.server.emit).toHaveBeenCalledWith('notification', { title: 'Hello' });
    });
  });

  describe('broadcastToRoom', () => {
    it('should broadcast to room', () => {
      service.broadcastToRoom('enterprise-456', 'campaign_update', { id: 'cmp-1' });

      expect(mockGateway.server.to).toHaveBeenCalledWith('enterprise-456');
      expect(mockGateway.server.emit).toHaveBeenCalledWith('campaign_update', { id: 'cmp-1' });
    });
  });

  describe('broadcastAll', () => {
    it('should broadcast to all connected clients', () => {
      service.broadcastAll('system_announcement', { message: 'Maintenance' });

      expect(mockGateway.server.emit).toHaveBeenCalledWith('system_announcement', { message: 'Maintenance' });
    });
  });
});