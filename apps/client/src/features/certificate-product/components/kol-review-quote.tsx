import React from "react";

type KolReviewQuoteProps = {
  quote: string;
};

export const KolReviewQuote: React.FC<KolReviewQuoteProps> = ({ quote }) => {
  return (
    <blockquote className="relative rounded-2xl border border-primary-soft bg-primary px-6 py-5 shadow-sm">
      {/* Decorative opening quote */}
      <span
        className="absolute -top-3 left-5 select-none text-4xl font-bold leading-none text-primary/20"
        aria-hidden
      >
        &ldquo;
      </span>

      <p className="text-sm leading-relaxed text-white italic">
        {quote}&rdquo;
      </p>
    </blockquote>
  );
};
