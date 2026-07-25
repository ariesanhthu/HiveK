import { SubscriptionFilterDto } from '@/application/dtos';

export class SubscriptionGetListQuery {
  constructor(public readonly filters: SubscriptionFilterDto) {}
}
