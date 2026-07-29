import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import {
  KOL_PROFILE_REPOSITORY,
  type IKolProfileRepository,
} from '@/core/interfaces/repositories';
import { KolProfileUpdateCommand } from './kol-profile-update.command';
import { KolProfileDto } from '@/application/dtos';
import { KolProfileMapper } from '@/application/mappers/kol-profile.mapper';
import { KolPlatformInfoVO } from '@/core/value-objects/kol-platform-info.value-object';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';

interface KolPlatformInput {
  platformId?: string;
  platform_id?: string;
  uniqueId?: string;
  handle?: string;
  externalId?: string;
  external_id?: string;
  followerCount?: number;
  follower_count?: number;
  avgEngagement?: number;
  avg_engagement?: number;
  topTags?: string[];
  top_tags?: string[];
  categories?: string[];
}

@CommandHandler(KolProfileUpdateCommand)
export class KolProfileUpdateCommandHandler implements ICommandHandler<
  KolProfileUpdateCommand,
  KolProfileDto
> {
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: KolProfileUpdateCommand): Promise<KolProfileDto> {
    const { id, input } = command;

    const existing = await this.kolProfileRepository.findById(id);
    if (!existing) {
      throw new UserNotFoundException(id);
    }

    const props = { ...existing.props };

    for (const [key, value] of Object.entries(input)) {
      if (key === 'isVerified') {
        props.isVerified = value as boolean;
      } else if (key === 'platforms' && Array.isArray(value)) {
        props.platforms = value.map((p: Record<string, unknown>) =>
          KolPlatformInfoVO.create({
            platformId: (p.platformId ?? p.platform_id) as string,
            uniqueId: (p.uniqueId ?? p.handle ?? '') as string,
            externalId: (p.externalId ?? p.external_id) as string,
            followerCount: (p.followerCount ?? p.follower_count) as number,
            avgEngagement: (p.avgEngagement ?? p.avg_engagement) as number,
            topTags: (p.topTags ?? p.top_tags) as string[],
            categories: p.categories as string[],
          }),
        );
      } else if (key in props) {
        (props as Record<string, unknown>)[key] = value;
      }
    }

    const updatedEntity = KolProfileEntity.create(props, existing.id);
    await this.kolProfileRepository.save(updatedEntity);

    return KolProfileMapper.toDto(updatedEntity);
  }
}
