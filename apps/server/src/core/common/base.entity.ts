export abstract class BaseEntity<Props> {
  protected readonly _id: string;
  public readonly props: Props;

  constructor(id: string, props: Props) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(object?: BaseEntity<Props>): boolean {
    if (object == null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof BaseEntity)) {
      return false;
    }

    return this._id === object.id;
  }
}
