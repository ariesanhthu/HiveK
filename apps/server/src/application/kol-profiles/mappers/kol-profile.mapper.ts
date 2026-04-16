import { KolProfileDto } from '../dtos';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';

export class KolProfileMapper {
  static toDto(entity: KolProfileEntity): KolProfileDto {
    return {
      id: entity.id!,
      name: entity.name,
      location: entity.location,
      gender: entity.gender,
      bio: entity.bio,
      email: entity.email,
      phone: entity.phone,
      isVerified: entity.isVerified,
      platforms: (entity.platforms || []).map((p) => ({
        platformId: p.props.platformId,
        handle: p.props.handle,
        externalId: p.props.externalId,
        followerCount: p.props.followerCount,
        avgEngagement: p.props.avgEngagement,
        topTags: p.props.topTags,
        categories: p.props.categories,
      })),
    };
  }

  static toListDto(entities: KolProfileEntity[]): KolProfileDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
