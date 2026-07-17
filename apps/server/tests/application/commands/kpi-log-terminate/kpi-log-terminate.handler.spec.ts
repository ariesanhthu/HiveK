import { KpiLogTerminateCommandHandler } from '@/application/commands/kpi-log-terminate/kpi-log-terminate.handler';
import { KpiLogTerminateCommand } from '@/application/commands/kpi-log-terminate/kpi-log-terminate.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignParticipantEntity } from '@/core/entities';
import { EParticipantStatus, ECampaignStatus } from '@/core/enums';
import { KpiTrackingTerminatedEvent } from '@/application/events';

describe('KpiLogTerminateCommandHandler', () => {
  let handler: KpiLogTerminateCommandHandler;
  let mockCampaignRepository: any;
  let mockEventBus: any;
  let mockUow: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByParticipantId: jest.fn(),
      save: jest.fn(),
    };
    mockEventBus = {
      publish: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new KpiLogTerminateCommandHandler(
      mockCampaignRepository,
      mockEventBus,
      mockUow,
    );
  });

  const participantId = 'participant-123';
  const outputId = 'output-456';

  it('should publish KpiTrackingTerminatedEvent when participant exists', async () => {
    const participant = CampaignParticipantEntity.instantiate(participantId, {
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const campaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-1',
      enterpriseId: 'ent-1',
      budget: 5000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.IN_PROGRESS,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [participant],
    });

    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new KpiLogTerminateCommand({ participantId, outputId });
    await handler.execute(command);

    expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(KpiTrackingTerminatedEvent));
  });

  it('should return early if payload is incomplete', async () => {
    const command = new KpiLogTerminateCommand({ participantId: '', outputId: '' });
    await handler.execute(command);

    expect(mockCampaignRepository.findByParticipantId).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it('should return early if campaign not found for participant', async () => {
    mockCampaignRepository.findByParticipantId.mockResolvedValue(null);

    const command = new KpiLogTerminateCommand({ participantId, outputId });
    await handler.execute(command);

    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
