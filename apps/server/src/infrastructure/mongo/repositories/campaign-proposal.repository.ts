import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CAMPAIGN_PROPOSAL_REPOSITORY, type ICampaignProposalRepository } from '@/core/interfaces/repositories';
import { CampaignProposalRoot } from '@/core/aggregate-roots';
import { MediaSlideVO, ProductItemVO, VoucherItemVO } from '@/core/value-objects';
import { CampaignProposalModel, CampaignProposalDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoCampaignProposalRepository implements ICampaignProposalRepository {
  constructor(
    @InjectModel(CampaignProposalModel.name)
    private readonly proposalModel: Model<CampaignProposalDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<CampaignProposalRoot>> {
    const doc = await this.proposalModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Nullable<CampaignProposalRoot>> {
    const doc = await this.proposalModel.findOne({ slug }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByCampaignId(campaignId: string): Promise<Nullable<CampaignProposalRoot>> {
    const doc = await this.proposalModel.findOne({
      campaign_id: new Types.ObjectId(campaignId) as any,
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(proposal: CampaignProposalRoot): Promise<void> {
    const data = this.mapToPersistence(proposal);

    if (!proposal.id) {
      const created = new this.proposalModel(data);
      const saved = await created.save({ session: this.session });
      proposal.setId(saved._id.toString());
    } else {
      await this.proposalModel.findByIdAndUpdate(proposal.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(proposals: CampaignProposalRoot[]): Promise<void> {
    await Promise.all(proposals.map((p) => this.save(p)));
  }

  async delete(id: string): Promise<void> {
    await this.proposalModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: CampaignProposalDocument): CampaignProposalRoot {
    if (!doc._id) {
      throw new Error('CampaignProposal document ID is missing');
    }
    return CampaignProposalRoot.instantiate(doc._id.toString(), {
      campaignId: doc.campaign_id.toString(),
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      mediaSlides: (doc.media_slides || []).map((slide) =>
        MediaSlideVO.create({
          type: slide.type,
          fileId: slide.file_id,
          displayOrder: slide.display_order,
        }),
      ),
      products: (doc.products || []).map((product) =>
        ProductItemVO.create({
          productId: product.product_id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          imageId: product.image_id,
          affiliateUrls: product.affiliate_urls instanceof Map
            ? Object.fromEntries(product.affiliate_urls)
            : (product.affiliate_urls || {}),
        }),
      ),
      vouchers: (doc.vouchers || []).map((voucher) =>
        VoucherItemVO.create({
          code: voucher.code,
          platform: voucher.platform,
          discountValue: voucher.discount_value,
          description: voucher.description,
          expirationDate: voucher.expiration_date,
        }),
      ),
      status: doc.status,
      metrics: doc.metrics instanceof Map
        ? Object.fromEntries(doc.metrics)
        : (doc.metrics || { totalViews: 0, totalClicks: 0 }),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: (doc as any).created_at,
      updatedAt: (doc as any).updated_at,
    });
  }

  private mapToPersistence(proposal: CampaignProposalRoot): Omit<CampaignProposalModel, 'created_at' | 'updated_at'> {
    return {
      campaign_id: new Types.ObjectId(proposal.campaignId) as any,
      slug: proposal.slug,
      title: proposal.title,
      description: proposal.description,
      media_slides: proposal.mediaSlides.map((slide) => ({
        type: slide.type,
        file_id: slide.fileId,
        display_order: slide.displayOrder,
      })),
      products: proposal.products.map((product) => ({
        product_id: product.productId,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image_id: product.imageId,
        affiliate_urls: product.affiliateUrls,
      })),
      vouchers: proposal.vouchers.map((voucher) => ({
        code: voucher.code,
        platform: voucher.platform,
        discount_value: voucher.discountValue,
        description: voucher.description,
        expiration_date: voucher.expirationDate,
      })),
      status: proposal.status,
      metrics: proposal.metrics,
      delete_at: proposal.deleteAt,
      delete_by: proposal.deleteBy,
    };
  }
}
