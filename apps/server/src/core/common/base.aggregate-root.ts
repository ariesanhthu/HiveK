import { BaseEntity } from './base.entity';

export abstract class BaseAggregateRoot<Props> extends BaseEntity<Props> {
  protected constructor(props: Props, id?: string) {
    super(props, id);
  }
}
