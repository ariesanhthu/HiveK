import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderCreateCommand } from './payment-provider-create.command';
import { PaymentProviderEntity } from '@/core/entities';
import {
  PAYMENT_PROVIDER_REPOSITORY,
  type IPaymentProviderRepository,
} from '@/core/interfaces/repositories';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderMapper } from '@/application/mappers';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PaymentProviderCreateCommand)
export class PaymentProviderCreateHandler implements ICommandHandler<
  PaymentProviderCreateCommand,
  PaymentProviderResponseDto
> {
  constructor(
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: PaymentProviderCreateCommand,
  ): Promise<PaymentProviderResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      const existingProvider = await this.providerRepository.findByCode(
        input.code,
      );
      if (existingProvider) {
        throw new Error(
          `Payment provider already exists with code: ${input.code}`,
        );
      }

      const entity = PaymentProviderEntity.create({
        code: input.code,
        displayName: input.displayName,
        supportedMethods: input.supportedMethods,
        supportedCurrencies: input.supportedCurrencies,
        credentials: input.credentials || {},
        isActive: input.isActive,
        supportsWebhook: input.supportsWebhook,
        supportsRefund: input.supportsRefund,
        supportsPartialRefund: input.supportsPartialRefund,
        baseUrl: input.baseUrl || undefined,
        testUrl: input.testUrl || undefined,
        webhookUrl: input.webhookUrl || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        deletedBy: undefined,
      });

      await this.providerRepository.save(entity);
      return PaymentProviderMapper.toDto(entity);
    });
  }
}
