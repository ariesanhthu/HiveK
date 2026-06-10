import { TargetType } from '@/core/enums/target-type.enum';

export class UploadedFileCreatedEvent {
  constructor(
    public readonly fileId: string,
    public readonly targetType: TargetType,
    public readonly targetId: string,
    public readonly targetField: string,
  ) {}
}
