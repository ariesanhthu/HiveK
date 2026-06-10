import { KolProfileDto } from '@/application/dtos';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';

export class KolProfileMapper {
  static toDto(entity: KolProfileEntity): KolProfileDto {
    return {
      id: entity.id!,
      userId: entity.userId,
      verificationType: entity.verificationType,
      name: entity.name,
      location: entity.location,
      gender: entity.gender,
      bio: entity.bio,
      email: entity.email,
      phone: entity.phone,
      isVerified: entity.isVerified,
      scores: entity.scores,
      platforms: (entity.platforms || []).map((p) => ({
        platformId: p.platformId,
        uniqueId: p.uniqueId,
        externalId: p.externalId,
        followerCount: p.followerCount,
        avgEngagement: p.avgEngagement,
        topTags: p.topTags,
        categories: p.categories,
      })),
    };
  }

  static toListDto(entities: KolProfileEntity[]): KolProfileDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
