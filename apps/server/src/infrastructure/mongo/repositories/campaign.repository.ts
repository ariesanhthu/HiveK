import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignModel, CampaignDocument } from '../schemas';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoCampaignRepository implements ICampaignRepository {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<CampaignRoot>> {
    const doc = await this.campaignModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(campaign: CampaignRoot): Promise<void> {
    const data = this.mapToPersistence(campaign);

    if (!campaign.id) {
      const created = new this.campaignModel(data);
      const saved = await created.save();
      campaign.setId(saved._id.toString());
    } else {
      await this.campaignModel.findByIdAndUpdate(campaign.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.campaignModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: CampaignDocument): CampaignRoot {
    if (!doc._id) {
      throw new Error('Campaign document ID is missing');
    }
    return CampaignRoot.instantiate(doc._id.toString(), {
      ownerId: doc.owner_id.toString(),
      enterpriseId: doc.enterprise_id.toString(),
      campaign: {
        name: doc.campaign.name,
        type: doc.campaign.type,
        startDate: doc.campaign.start_date,
        endDate: doc.campaign.end_date,
        objective: doc.campaign.objective,
        description: doc.campaign.description,
      },
      targeting: {
        audience: {
          ageRange: doc.targeting.audience.age_range,
          interests: doc.targeting.audience.interests,
        },
        locations: doc.targeting.locations,
      },
      campaignItems: doc.campaign_items.map((item) => ({
        product: {
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand,
          description: item.product.description,
          features: item.product.features,
          keywords: item.product.keywords,
          priceSegment: item.product.price_segment,
        },
        marketing: {
          angle: item.marketing.angle,
          contentStyle: item.marketing.content_style,
          tone: item.marketing.tone,
          keyMessages: item.marketing.key_messages,
        },
        pricing: {
          originalPrice: item.pricing.original_price,
          salePrice: item.pricing.sale_price,
          currency: item.pricing.currency,
        },
        promotion: {
          type: item.promotion.type,
          value: item.promotion.value,
          unit: item.promotion.unit,
        },
        channels: item.channels.map((chan) => ({
          type: chan.type,
          platform: chan.platform,
          url: chan.url,
        })),
      })),
      raw: doc.raw.map((r) => ({
        fileId: r.file_id,
        rawText: r.raw_text,
        inference: r.inference,
      })),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(campaign: CampaignRoot): Omit<CampaignModel, 'created_at' | 'updated_at'> {
    return {
      owner_id: new Types.ObjectId(campaign.ownerId) as any,
      enterprise_id: new Types.ObjectId(campaign.enterpriseId) as any,
      campaign: {
        name: campaign.campaign.name,
        type: campaign.campaign.type,
        start_date: campaign.campaign.startDate,
        end_date: campaign.campaign.endDate,
        objective: campaign.campaign.objective,
        description: campaign.campaign.description,
      },
      targeting: {
        audience: {
          age_range: campaign.targeting.audience.ageRange,
          interests: campaign.targeting.audience.interests,
        },
        locations: campaign.targeting.locations,
      },
      campaign_items: campaign.campaignItems.map((item) => ({
        product: {
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand,
          description: item.product.description,
          features: item.product.features,
          keywords: item.product.keywords,
          price_segment: item.product.priceSegment,
        },
        marketing: {
          angle: item.marketing.angle,
          content_style: item.marketing.contentStyle,
          tone: item.marketing.tone,
          key_messages: item.marketing.keyMessages,
        },
        pricing: {
          original_price: item.pricing.originalPrice,
          sale_price: item.pricing.salePrice,
          currency: item.pricing.currency,
        },
        promotion: {
          type: item.promotion.type,
          value: item.promotion.value,
          unit: item.promotion.unit,
        },
        channels: item.channels.map((chan) => ({
          type: chan.type,
          platform: chan.platform,
          url: chan.url,
        })),
      })),
      raw: campaign.raw.map((r) => ({
        file_id: r.fileId,
        raw_text: r.rawText,
        inference: r.inference,
      })),
      delete_at: campaign.deleteAt,
      delete_by: campaign.deleteBy,
    };
  }
}
