import { CampaignCreateCommand } from '@/application/commands/campaign-create/campaign-create.command';
import { CampaignCreateCommandHandler } from '@/application/commands/campaign-create/campaign-create.handler';

describe('CampaignCreateCommandHandler', () => {
  let handler: CampaignCreateCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      save: jest.fn(),
    };
    handler = new CampaignCreateCommandHandler(mockCampaignRepository);
  });

  it('should create a campaign successfully', async () => {
    const input = {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      budget: 1000,
      financialTarget: { target: 2000 },
      description: 'Promo campaign',
      platformTarget: [],
    };

    const command = new CampaignCreateCommand(input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockCampaignRepository.save).toHaveBeenCalled();
  });
});
