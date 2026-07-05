import { BaseValueObject } from '../common/base.value-object';
import { EMediaSlideType } from '../enums';

export interface MediaSlideProps {
  type: EMediaSlideType;
  fileId: string;
  displayOrder: number;
}

export class MediaSlideVO extends BaseValueObject<MediaSlideProps> {
  private constructor(props: MediaSlideProps) {
    super(props);
  }

  public static create(props: MediaSlideProps): MediaSlideVO {
    if (props.displayOrder < 0) {
      throw new Error('Display order must be non-negative');
    }
    return new MediaSlideVO(props);
  }

  get type(): EMediaSlideType {
    return this.props.type;
  }

  get fileId(): string {
    return this.props.fileId;
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }
}
