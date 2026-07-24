import { ProposalDto } from '@/application/dtos';
import { ProposalMapper } from '@/application/mappers';
import { ProposalNotFoundException } from '@/core/exceptions';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { MediaSlideVO, ProductItemVO, VoucherItemVO } from '@/core/value-objects';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProposalUpdateCommand } from './proposal-update.command';

interface UpdateFields {
  title?: string;
  description?: string;
  mediaSlides?: MediaSlideVO[];
  products?: ProductItemVO[];
  vouchers?: VoucherItemVO[];
}

@CommandHandler(ProposalUpdateCommand)
export class ProposalUpdateCommandHandler implements
  ICommandHandler<
    ProposalUpdateCommand,
    ProposalDto
  >
{
  constructor(
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY) private readonly proposalRepository:
      ICampaignProposalRepository,
  ) {}

  async execute(command: ProposalUpdateCommand): Promise<ProposalDto> {
    const { id, input } = command;

    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) {
      throw new ProposalNotFoundException(id);
    }

    const updateProps: UpdateFields = {};

    if (input.title !== undefined) updateProps.title = input.title;
    if (input.description !== undefined) {
      updateProps.description = input.description;
    }
    if (input.mediaSlides !== undefined) {
      updateProps.mediaSlides = input.mediaSlides.map((slide) =>
        MediaSlideVO.create({
          type: slide.type,
          fileId: slide.fileId,
          displayOrder: slide.displayOrder,
        })
      );
    }
    if (input.products !== undefined) {
      updateProps.products = input.products.map((product) =>
        ProductItemVO.create({
          productId: product.productId,
          name: product.name,
          price: product.price,
          currency: product.currency,
          imageId: product.imageId,
          affiliateUrls: product.affiliateUrls || {},
        })
      );
    }
    if (input.vouchers !== undefined) {
      updateProps.vouchers = input.vouchers.map((voucher) =>
        VoucherItemVO.create({
          code: voucher.code,
          platform: voucher.platform,
          discountValue: voucher.discountValue,
          description: voucher.description,
          expirationDate: voucher.expirationDate instanceof Date
            ? voucher.expirationDate
            : new Date(voucher.expirationDate),
        })
      );
    }

    proposal.update(updateProps);
    await this.proposalRepository.save(proposal);

    return ProposalMapper.toDto(proposal);
  }
}
