import { ProposalDto } from '@/application/dtos';
import { CampaignProposalRoot } from '@/core/aggregate-roots';

export class ProposalMapper {
  static toDto(root: CampaignProposalRoot): ProposalDto {
    return {
      id: root.id!,
      campaignId: root.campaignId,
      slug: root.slug,
      title: root.title,
      description: root.description,
      mediaSlides: root.mediaSlides.map((slide) => ({
        type: slide.type,
        fileId: slide.fileId,
        displayOrder: slide.displayOrder,
      })),
      products: root.products.map((product) => ({
        productId: product.productId,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageId: product.imageId,
        affiliateUrls: product.affiliateUrls,
      })),
      vouchers: root.vouchers.map((voucher) => ({
        code: voucher.code,
        platform: voucher.platform,
        discountValue: voucher.discountValue,
        description: voucher.description,
        expirationDate: voucher.expirationDate.toISOString(),
      })),
      status: root.status,
      metrics: root.metrics,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(roots: CampaignProposalRoot[]): ProposalDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
