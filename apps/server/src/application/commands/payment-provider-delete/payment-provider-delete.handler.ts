import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderDeleteCommand } from './payment-provider-delete.command';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PaymentProviderDeleteCommand)
export class PaymentProviderDeleteHandler implements ICommandHandler<PaymentProviderDeleteCommand, void> {
  constructor(
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PaymentProviderDeleteCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      const provider = await this.providerRepository.findById(input.id);
      if (!provider) {
        throw new Error(`Payment provider not found: ${input.id}`);
      }

      // Soft delete: set deletedAt and deletedBy
      provider.markAsDeleted(input.deletedBy);

      await this.providerRepository.save(provider);
    });
  }
}
