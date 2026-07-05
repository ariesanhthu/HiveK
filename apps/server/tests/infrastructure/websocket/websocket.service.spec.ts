import { WebSocketService } from '@/infrastructure/websocket/websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockServer: any;

  beforeEach(() => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    service = new WebSocketService();
    service.server = mockServer;
  });

  describe('emitToUser', () => {
    it('should emit to user room', () => {
      service.emitToUser('user-123', 'notification', { title: 'Hello' });

      expect(mockServer.to).toHaveBeenCalledWith('user_user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('notification', { title: 'Hello' });
    });
  });

  describe('broadcastToRoom', () => {
    it('should broadcast to room', () => {
      service.broadcastToRoom('enterprise-456', 'campaign_update', { id: 'cmp-1' });

      expect(mockServer.to).toHaveBeenCalledWith('enterprise-456');
      expect(mockServer.emit).toHaveBeenCalledWith('campaign_update', { id: 'cmp-1' });
    });
  });

  describe('broadcastAll', () => {
    it('should broadcast to all connected clients', () => {
      service.broadcastAll('system_announcement', { message: 'Maintenance' });

      expect(mockServer.emit).toHaveBeenCalledWith('system_announcement', { message: 'Maintenance' });
    });
  });

  describe('disconnectUser', () => {
    it('should disconnect all sockets in user room', async () => {
      const mockSocket = { disconnect: jest.fn() };
      mockServer.in = jest.fn().mockReturnThis();
      mockServer.fetchSockets = jest.fn().mockResolvedValue([mockSocket]);

      await service.disconnectUser('user-123');

      expect(mockServer.in).toHaveBeenCalledWith('user_user-123');
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should do nothing if server is not defined', async () => {
      service.server = undefined as any;
      await expect(service.disconnectUser('user-123')).resolves.not.toThrow();
    });
  });
});