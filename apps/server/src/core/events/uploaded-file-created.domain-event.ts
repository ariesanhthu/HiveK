import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';
import { ETargetType } from '../enums/target-type.enum';

export interface UploadedFileCreatedPayload {
  fileId: string;
  targetType: ETargetType;
  targetId: string;
  targetField: string;
}

export class UploadedFileCreatedEvent extends DomainEvent<UploadedFileCreatedPayload> {
  public readonly eventType = 'UploadedFileCreated';
  public readonly aggregateType = EAggregateType.UPLOADED_FILE;

  constructor(
    aggregateId: string,
    payload: UploadedFileCreatedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
