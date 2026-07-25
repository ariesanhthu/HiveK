import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PaymentCompletedEvent } from '@/core/events';
import { SubscriptionUpdateCommand } from '@/application/commands/subscription-update/subscription-update.command';

@EventsHandler(PaymentCompletedEvent)
export class PaymentCompletedEventHandler implements IEventHandler<PaymentCompletedEvent> {
  private readonly logger = new Logger(PaymentCompletedEventHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async handle(event: PaymentCompletedEvent) {
    const { userId, billId } = event.payload;
    this.logger.log(`Handling PaymentCompletedEvent for user: ${userId}, bill: ${billId}`);

    // Defer to next tick to avoid nested Unit of Work.
    // The PaymentCaptureHandler runs within a UoW transaction, and
    // SubscriptionUpdateHandler starts its own UoW. Nesting UoW calls
    // can cause session conflicts. Deferring breaks out of the current
    // transaction context.
    setImmediate(async () => {
      try {
        await this.commandBus.execute(
          new SubscriptionUpdateCommand({
            userId,
            billId,
          })
        );
        this.logger.log(`Successfully dispatched SubscriptionUpdateCommand for bill: ${billId}`);
      } catch (error) {
        this.logger.error(
          `Failed to update subscription after payment completed for bill ${billId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }
}
