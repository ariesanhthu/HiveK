import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { KolProfileModel, KolProfileDocument } from '@/infrastructure/mongo/schemas';
import { UpdateKolProfileCommand } from '../update-kol-profile.command';
import { KolProfileDto } from '../../dtos';

@CommandHandler(UpdateKolProfileCommand)
export class UpdateKolProfileHandler implements ICommandHandler<UpdateKolProfileCommand, KolProfileDto> {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
  ) {}

  async execute(command: UpdateKolProfileCommand): Promise<KolProfileDto> {
    const { id, input } = command;

    // Load current document to check existence
    const existing = await this.kolProfileModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Influencer with ID ${id} not found`);
    }

    const updateDoc: any = {};

    // Map common fields dynamically
    for (const [key, value] of Object.entries(input)) {
      if (key === 'isVerified') {
        updateDoc.is_verified = value;
      } else if (key === 'platforms' && Array.isArray(value)) {
        updateDoc.platforms = value.map((p: any) => ({
          platform_id: p.platformId ?? p.platform_id,
          uniqueId: p.uniqueId ?? p.handle,
          external_id: p.externalId ?? p.external_id,
          follower_count: p.followerCount ?? p.follower_count,
          avg_engagement: p.avgEngagement ?? p.avg_engagement,
          top_tags: p.topTags ?? p.top_tags,
          categories: p.categories,
        }));
      } else {
        // Pass all other fields directly (including custom scores, name, bio, etc.)
        updateDoc[key] = value;
      }
    }

    // Perform PATCH update
    const updated = await this.kolProfileModel
      .findByIdAndUpdate(id, { $set: updateDoc }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Influencer with ID ${id} not found during update`);
    }

    // Map to KolProfileDto
    return {
      id: updated._id.toString(),
      name: updated.name,
      location: updated.location,
      gender: updated.gender,
      bio: updated.bio,
      email: updated.email,
      phone: updated.phone,
      isVerified: updated.is_verified,
      scores: updated.scores || {},
      platforms: (updated.platforms || []).map((p: any) => ({
        platformId: p.platform_id,
        uniqueId: p.uniqueId ?? p.handle ?? '',
        externalId: p.external_id,
        followerCount: p.follower_count,
        avgEngagement: p.avg_engagement,
        topTags: p.top_tags,
        categories: p.categories,
      })),
    };
  }
}
