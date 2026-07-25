import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderRestoreCommand } from './payment-provider-restore.command';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PaymentProviderRestoreCommand)
export class PaymentProviderRestoreHandler implements ICommandHandler<PaymentProviderRestoreCommand, void> {
  constructor(
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PaymentProviderRestoreCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      const provider = await this.providerRepository.findById(input.id);
      if (!provider) {
        throw new Error(`Payment provider not found: ${input.id}`);
      }

      // Restore: set deletedAt and deletedBy to undefined
      provider.restore();

      await this.providerRepository.save(provider);
    });
  }
}
