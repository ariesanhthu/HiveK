import { UserAddedToEnterpriseHandler } from '@/application/events/user-added-to-enterprise/user-added-to-enterprise.handler';
import { UserAddedToEnterpriseEvent } from '@/application/events/user-added-to-enterprise/user-added-to-enterprise.event';
import { NotificationSendCommand } from '@/application/commands';

describe('UserAddedToEnterpriseHandler', () => {
  let handler: UserAddedToEnterpriseHandler;
  let mockCommandBus: any;

  beforeEach(() => {
    mockCommandBus = {
      execute: jest.fn(),
    };
    handler = new UserAddedToEnterpriseHandler(mockCommandBus);
  });

  it('should dispatch NotificationSendCommand when user is added to enterprise', async () => {
    const event = new UserAddedToEnterpriseEvent('user-123', 'ent-1');
    await handler.handle(event);

    expect(mockCommandBus.execute).toHaveBeenCalledWith(expect.any(NotificationSendCommand));
    const command = mockCommandBus.execute.mock.calls[0][0];
    expect(command.props.audience.userIds).toContain('user-123');
    expect(command.props.content).toContain('ent-1');
  });
});
