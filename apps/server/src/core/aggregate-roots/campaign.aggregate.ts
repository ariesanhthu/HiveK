import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';

export interface CampaignProps {
  ownerId: string;
  enterpriseId: string;
  campaign: {
    name: string;
    type: 'promotion' | 'launch' | 'seasonal';
    startDate: Date;
    endDate: Date;
    objective: string;
    description: string;
  };
  targeting: {
    audience: {
      ageRange: string;
      interests: string[];
    };
    locations: string[];
  };
  campaignItems: {
    product: {
      name: string;
      category: string;
      brand: string;
      description: string;
      features: string[];
      keywords: string[];
      priceSegment: 'low' | 'mid' | 'high';
    };
    marketing: {
      angle: string[];
      contentStyle: string[];
      tone: string[];
      keyMessages: string[];
    };
    pricing: {
      originalPrice: number;
      salePrice: number;
      currency: string;
    };
    promotion: {
      type: 'discount' | 'bundle' | 'cashback';
      value: number;
      unit: 'percent' | 'amount';
    };
    channels: {
      type: 'ecommerce' | 'retail' | 'social';
      platform: string;
      url: string;
    }[];
  }[];
  raw: {
    fileId: string;
    rawText: string;
    inference: string;
  }[];
}

export class CampaignRoot extends BaseAggregateRoot<CampaignProps> {
  private constructor(props: CampaignProps, id?: string) {
    super(props, id);
  }

  public static create(props: CampaignProps): CampaignRoot {
    return new CampaignRoot(props);
  }

  public static instantiate(id: string, props: CampaignProps): CampaignRoot {
    return new CampaignRoot(props, id);
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get campaign() {
    return this.props.campaign;
  }

  get targeting() {
    return this.props.targeting;
  }

  get campaignItems() {
    return this.props.campaignItems;
  }

  get raw() {
    return this.props.raw;
  }

  public update(props: Partial<CampaignProps>): void {
    if (props.ownerId) this.props.ownerId = props.ownerId;
    if (props.enterpriseId) this.props.enterpriseId = props.enterpriseId;
    if (props.campaign) this.props.campaign = { ...this.props.campaign, ...props.campaign };
    if (props.targeting) this.props.targeting = { ...this.props.targeting, ...props.targeting };
    if (props.campaignItems) this.props.campaignItems = props.campaignItems;
    if (props.raw) this.props.raw = props.raw;
  }
}
