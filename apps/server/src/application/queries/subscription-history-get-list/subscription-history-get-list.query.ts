import { SubscriptionHistoryFilterDto } from '@/application/dtos';

export class SubscriptionHistoryGetListQuery {
  constructor(public readonly filters: SubscriptionHistoryFilterDto) {}
}
