import { KpiLogTerminateCommand } from '@/application/commands/kpi-log-terminate/kpi-log-terminate.command';
import { KpiLogTerminateCommandHandler } from '@/application/commands/kpi-log-terminate/kpi-log-terminate.handler';
import { KpiTrackingTerminatedEvent } from '@/application/events';
import { CampaignParticipantRoot } from '@/core/aggregate-roots/campaign-participant.aggregate';
import { EOutputStatus, EOutputType, EParticipantStatus } from '@/core/enums';

describe('KpiLogTerminateCommandHandler', () => {
  let handler: KpiLogTerminateCommandHandler;
  let mockParticipantRepository: any;
  let mockEventBus: any;
  let mockUow: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockEventBus = {
      publish: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new KpiLogTerminateCommandHandler(
      mockParticipantRepository,
      mockEventBus,
      mockUow,
    );
  });

  const participantId = 'participant-123';
  const outputId = 'output-456';

  const createMockParticipant = () => {
    const participant = CampaignParticipantRoot.instantiate(participantId, {
      campaignId: 'campaign-123',
      kolProfileId: 'kol-123',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [
        {
          id: outputId,
          platformId: 'platform-1',
          outputType: EOutputType.VIDEO,
          title: 'Test Video',
          isScheduleForPost: false,
          fileId: null,
          scheduledAt: null,
          status: EOutputStatus.PUBLISHED,
          url: 'https://video.com',
          postedAt: new Date(),
          isTrackingActive: true,
        },
      ],
      deleteAt: null,
      deleteBy: null,
    });
    return participant;
  };

  it('should successfully terminate tracking and publish event', async () => {
    const participant = createMockParticipant();
    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new KpiLogTerminateCommand({ participantId, outputId });
    await handler.execute(command);

    expect(participant.outputs[0].isTrackingActive).toBe(false);
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
    expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(KpiTrackingTerminatedEvent));
  });

  it('should return early if payload is incomplete', async () => {
    const command = new KpiLogTerminateCommand({ participantId: '', outputId: '' });
    await handler.execute(command);

    expect(mockParticipantRepository.findById).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it('should return early if participant not found', async () => {
    mockParticipantRepository.findById.mockResolvedValue(null);

    const command = new KpiLogTerminateCommand({ participantId, outputId });
    await handler.execute(command);

    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
