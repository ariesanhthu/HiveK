import { Command } from '@nestjs/cqrs';
import { SubscriptionUpdateInputDto } from './subscription-update.dto';

export class SubscriptionUpdateCommand extends Command<void> {
  constructor(public readonly input: SubscriptionUpdateInputDto) {
    super();
  }
}
