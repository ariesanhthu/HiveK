import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { ETargetType } from '../enums/target-type.enum';
import { Nullable } from '@/core/types';
import { UploadedFileCreatedEvent } from '../events/uploaded-file-created.domain-event';

export interface UploadedFileProps {
  url: string;
  publicId: string;
  size: number;
  format: string;
  title: Nullable<string>;
  targetType: ETargetType;
  targetId: string;
  targetField: string;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFileCreateProps {
  url: string;
  publicId: string;
  size: number;
  format: string;
  title?: Nullable<string>;
  targetType: ETargetType;
  targetId: string;
  targetField: string;
}

/**
 * Aggregate root for files uploaded to the system storage.
 */
export class UploadedFileRoot extends BaseAggregateRoot<UploadedFileProps> {
  private constructor(props: UploadedFileProps, id?: string) {
    super(props, id);
  }

  public static create(props: UploadedFileCreateProps): UploadedFileRoot {
    const now = new Date();
    const root = new UploadedFileRoot({
      ...props,
      title: props.title ?? null,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
    });
    root.addDomainEvent(
      new UploadedFileCreatedEvent(root.id!, {
        fileId: root.id!,
        targetType: root.targetType,
        targetId: root.targetId,
        targetField: root.targetField,
      }),
    );
    return root;
  }

  public static instantiate(id: string, props: UploadedFileProps): UploadedFileRoot {
    return new UploadedFileRoot(props, id);
  }

  get url(): string {
    return this.props.url;
  }

  get publicId(): string {
    return this.props.publicId;
  }

  get size(): number {
    return this.props.size;
  }

  get format(): string {
    return this.props.format;
  }

  get title(): Nullable<string> {
    return this.props.title;
  }

  get targetType(): ETargetType {
    return this.props.targetType;
  }

  get targetId(): string {
    return this.props.targetId;
  }

  get targetField(): string {
    return this.props.targetField;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }
}
