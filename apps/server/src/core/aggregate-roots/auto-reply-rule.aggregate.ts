import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';

export interface AutoReplyRuleProps {
  enterpriseId: string;
  socialPageId: string;
  name: string;
  isEnabled: boolean;
  keywords: string[];
  replyContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AutoReplyRuleCreateProps = Omit<
  AutoReplyRuleProps,
  'isEnabled' | 'createdAt' | 'updatedAt'
> & {
  isEnabled?: boolean;
};

export class AutoReplyRuleRoot extends BaseAggregateRoot<AutoReplyRuleProps> {
  private constructor(props: AutoReplyRuleProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: AutoReplyRuleCreateProps,
    id?: string,
  ): AutoReplyRuleRoot {
    const now = new Date();
    return new AutoReplyRuleRoot(
      {
        ...props,
        isEnabled: props.isEnabled !== undefined ? props.isEnabled : true,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
  }

  public static instantiate(
    id: string,
    props: AutoReplyRuleProps,
  ): AutoReplyRuleRoot {
    return new AutoReplyRuleRoot(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }
  get socialPageId(): string {
    return this.props.socialPageId;
  }
  get name(): string {
    return this.props.name;
  }
  get isEnabled(): boolean {
    return this.props.isEnabled;
  }
  get keywords(): string[] {
    return [...this.props.keywords];
  }
  get replyContent(): string {
    return this.props.replyContent;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public enable(): void {
    this.props.isEnabled = true;
    this.props.updatedAt = new Date();
  }

  public disable(): void {
    this.props.isEnabled = false;
    this.props.updatedAt = new Date();
  }

  public updateRule(
    name?: string,
    keywords?: string[],
    replyContent?: string,
  ): void {
    if (name !== undefined) this.props.name = name;
    if (keywords !== undefined) this.props.keywords = [...keywords];
    if (replyContent !== undefined) this.props.replyContent = replyContent;
    this.props.updatedAt = new Date();
  }
}
