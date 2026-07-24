import { ProposalDto } from '@/application/dtos';
import { ProposalMapper } from '@/application/mappers';
import { CampaignProposalRoot } from '@/core/aggregate-roots';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { MediaSlideVO, ProductItemVO, VoucherItemVO } from '@/core/value-objects';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProposalCreateCommand } from './proposal-create.command';

@CommandHandler(ProposalCreateCommand)
export class ProposalCreateCommandHandler implements
  ICommandHandler<
    ProposalCreateCommand,
    ProposalDto
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY) private readonly proposalRepository:
      ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalCreateCommand): Promise<ProposalDto> {
    const { input } = command;

    const proposal = CampaignProposalRoot.create({
      campaignId: input.campaignId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      mediaSlides: (input.mediaSlides || []).map((slide) =>
        MediaSlideVO.create({
          type: slide.type,
          fileId: slide.fileId,
          displayOrder: slide.displayOrder,
        })
      ),
      products: (input.products || []).map((product) =>
        ProductItemVO.create({
          productId: product.productId,
          name: product.name,
          price: product.price,
          currency: product.currency,
          imageId: product.imageId,
          affiliateUrls: product.affiliateUrls || {},
        })
      ),
      vouchers: (input.vouchers || []).map((voucher) =>
        VoucherItemVO.create({
          code: voucher.code,
          platform: voucher.platform,
          discountValue: voucher.discountValue,
          description: voucher.description,
          expirationDate: voucher.expirationDate instanceof Date
            ? voucher.expirationDate
            : new Date(voucher.expirationDate),
        })
      ),
    });

    await this.proposalRepository.save(proposal);

    return ProposalMapper.toDto(proposal);
  }
}
