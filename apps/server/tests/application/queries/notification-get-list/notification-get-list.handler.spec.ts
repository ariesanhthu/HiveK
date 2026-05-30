import { NotificationGetListQueryHandler } from '@/application/queries/notification-get-list/notification-get-list.handler';
import { NotificationGetListQuery } from '@/application/queries/notification-get-list/notification-get-list.query';

describe('NotificationGetListQueryHandler', () => {
  let handler: NotificationGetListQueryHandler;
  let mockNotificationReadService: any;

  beforeEach(() => {
    mockNotificationReadService = {
      findAll: jest.fn(),
    };
    handler = new NotificationGetListQueryHandler(mockNotificationReadService);
  });

  it('should call findAll on read service with filters', async () => {
    const filters = { recipientId: 'user-123', limit: 10 };
    const query = new NotificationGetListQuery(filters);

    mockNotificationReadService.findAll.mockResolvedValue({ items: [], nextCursor: null });

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(mockNotificationReadService.findAll).toHaveBeenCalledWith(filters);
  });
});
