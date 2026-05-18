import React from "react";
import type {
  CertificateProduct,
  CertificatePerk,
} from "@/features/certificate-product/types";

type ProductCardProps = {
  product: CertificateProduct;
  perks: CertificatePerk[];
};

function formatPrice(price: number, currency: string): string {
  return `${currency}${price.toLocaleString("vi-VN")}`;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, perks }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-soft bg-card shadow-sm">
      {/* Product image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product info */}
      <div className="p-5">
        {/* Category badge */}
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          Sản phẩm nổi bật
        </span>

        <h2 className="mt-2.5 text-lg font-bold text-foreground leading-snug">
          {product.name}
        </h2>

        <p className="mt-1 line-clamp-2 text-sm text-foreground-muted leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <p className="mt-3 text-xl font-extrabold text-foreground">
          {formatPrice(product.price, product.currency)}
        </p>

        {/* CTA Button */}
        <a
          href={product.productPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] transition-all hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)]"
        >
          Xem trang sản phẩm
          <span className="material-symbols-outlined text-base">
            arrow_forward
          </span>
        </a>

        {/* Perks */}
        <div className="mt-4 space-y-2.5 border-t border-primary-soft pt-4">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="flex items-center gap-2.5 text-sm text-foreground-muted"
            >
              <span className="material-symbols-outlined text-lg text-primary">
                {perk.icon}
              </span>
              {perk.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
