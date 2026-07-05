import { BaseValueObject } from '../common/base.value-object';
import { Nullable } from '../types';

export interface ProductItemProps {
  productId: string;
  name: string;
  price: number;
  currency: string;
  imageId: string;
  affiliateUrls: Record<string, string>;
}

export class ProductItemVO extends BaseValueObject<ProductItemProps> {
  private constructor(props: ProductItemProps) {
    super(props);
  }

  public static create(props: ProductItemProps): ProductItemVO {
    if (props.price < 0) {
      throw new Error('Price must be non-negative');
    }
    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }
    return new ProductItemVO(props);
  }

  get productId(): string {
    return this.props.productId;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get currency(): string {
    return this.props.currency;
  }

  get imageId(): string {
    return this.props.imageId;
  }

  get affiliateUrls(): Record<string, string> {
    return { ...this.props.affiliateUrls };
  }

  /**
   * Get the affiliate URL for a specific KOL profile.
   */
  public getAffiliateUrl(kolProfileId: string): Nullable<string> {
    return this.props.affiliateUrls[kolProfileId] || null;
  }
}
