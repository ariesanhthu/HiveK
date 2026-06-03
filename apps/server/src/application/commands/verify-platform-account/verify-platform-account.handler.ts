import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  KOL_PROFILE_REPOSITORY,
  type IKolProfileRepository,
} from '@/core/interfaces/repositories';
import {
  MESSAGE_QUEUE_SERVICE,
  type IMessageQueueService,
} from '@/application/interfaces';
import { VerifyPlatformAccountCommand } from './verify-platform-account.command';
import { KolProfileDto } from '@/application/dtos';
import { KolProfileMapper } from '@/application/mappers/kol-profile.mapper';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';
import { KolPlatformInfo } from '@/core/value-objects/kol-platform-info.value-object';

@CommandHandler(VerifyPlatformAccountCommand)
export class VerifyPlatformAccountHandler
  implements ICommandHandler<VerifyPlatformAccountCommand, KolProfileDto>
{
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
    @Inject(MESSAGE_QUEUE_SERVICE)
    private readonly mqService: IMessageQueueService,
  ) {}

  async execute(command: VerifyPlatformAccountCommand): Promise<KolProfileDto> {
    const { userId, platformId, externalId, uniqueId, displayName, email } =
      command;

    // 1. Check if a profile with this platform already exists
    let profile = await this.kolProfileRepository.findByPlatformInfo(
      platformId,
      externalId,
    );

    if (profile) {
      // Link user and update verification
      profile.linkUser(userId, 'OAUTH');
      await this.kolProfileRepository.save(profile);
    } else {
      // 2. Check if the user already has a profile
      profile = await this.kolProfileRepository.findByUserId(userId);

      const newPlatform = KolPlatformInfo.create({
        platformId,
        uniqueId,
        externalId,
        followerCount: 0,
        avgEngagement: 0,
        topTags: [],
        categories: [],
      });

      if (profile) {
        // Append platform connection info, link user, set verified
        profile.addPlatform(newPlatform);
        profile.linkUser(userId, 'OAUTH');
        await this.kolProfileRepository.save(profile);
      } else {
        // Create new KOL profile
        profile = KolProfileEntity.create({
          userId,
          verificationType: 'OAUTH',
          name: displayName,
          location: '',
          gender: '',
          bio: '',
          email,
          phone: '',
          platforms: [newPlatform],
          isVerified: true,
          scores: {},
        });
        await this.kolProfileRepository.save(profile);
      }

      // Publish task to crawl platform data
      this.mqService.emit('crawl_platform_data', {
        platformId,
        externalId,
        uniqueId,
        kolProfileId: profile.id,
      });
    }

    return KolProfileMapper.toDto(profile);
  }
}
