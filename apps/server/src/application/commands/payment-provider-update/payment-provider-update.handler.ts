import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderUpdateCommand } from './payment-provider-update.command';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderMapper } from '@/application/mappers';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PaymentProviderUpdateCommand)
export class PaymentProviderUpdateHandler implements ICommandHandler<PaymentProviderUpdateCommand, PaymentProviderResponseDto> {
  constructor(
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PaymentProviderUpdateCommand): Promise<PaymentProviderResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      const provider = await this.providerRepository.findById(input.id);
      if (!provider) {
        throw new Error(`Payment provider not found: ${input.id}`);
      }

      provider.update({
        displayName: input.displayName,
        supportedMethods: input.supportedMethods,
        supportedCurrencies: input.supportedCurrencies,
        credentials: input.credentials,
        isActive: input.isActive,
        supportsWebhook: input.supportsWebhook,
        supportsRefund: input.supportsRefund,
        supportsPartialRefund: input.supportsPartialRefund,
        baseUrl: input.baseUrl || undefined,
        testUrl: input.testUrl || undefined,
        webhookUrl: input.webhookUrl || undefined,
      });

      await this.providerRepository.save(provider);
      return PaymentProviderMapper.toDto(provider);
    });
  }
}
