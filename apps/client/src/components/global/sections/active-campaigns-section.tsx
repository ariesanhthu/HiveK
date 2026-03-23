import React from "react";

type CampaignCardProps = {
  image: string;
  category: string;
  title: string;
  priceRange: string;
};

const CAMPAIGNS: CampaignCardProps[] = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    category: "Footwear",
    title: "Nike: Future Speed Run",
    priceRange: "$2,500 - $5,000",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4gDyTExo7JHPJhFGLA1XGBMAAGr1hVcrRQY8l5v2tQEIE9C6dyQOKIzF47f-yi5tukgIiPoOv0PL9eV2HfNri99JLKbncAHxXUl8GceBmeg6SSapfuATebfqUUZC9yKbcIltw-hm1j3UfWdQ4uTrIJsJ7lI_P_-FXsgTYqtqtHb8Ih5l3pK41FsHdjkX1Zi1sapXdJAC933HGqEF5YenG-i8TyQ_F3eXjz0WHGPHNeusvCfGKvEot-URRCeIEeM80s97Q-zb0bcg",
    category: "Electronics",
    title: "SoundMaster Pro Review",
    priceRange: "$1,200 - $3,000",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCx6Vdn_4jBlqNYfFDAPiJdPNNYoCabdh19H7HPUNtiHdn2cDQX24gVnCj-9JWLgyE0ouBjGdKwcaPFKDOfzz2Yc6qaRMLspmCAzUxIb23g69wGCi6gLzf3A0oSb01YKsNrx3ALruHI98sC9bpxh9CWcuvNRC-lQMnX70J3IDq14cyG9EsdcLcpIGyd9K6JIEKHSSyGWYKJPpttPbLuBYcj5jbaY7ula4JFzrqtS1h7UVdsd4OSuGWkAwphMjVU_Q_0DDUYMEtltsQ",
    category: "Luxury",
    title: "Elite Chrono Collection",
    priceRange: "$4,000 - $8,000",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGNFx3ga3X-8637lzaPRAq_1ZHlA7hi7p5b7GWKOJQoVbyqT0sAppFzUJhqr9PSwqXA2PxZC0g6x4N6uKb3jQ5AbrcUMBDMDXbwRaKJA6MbHhenSmsm5zG_HfPH8OaZnSWjx5o8zhVefYq0Z3z6fdQdsclsyjMb8RazsTvcHhXc7UbIt09Yw5kjrhyuZegRVS-pcj0PGtxtiHggrAekejcpTL9UgATYK1vByWBYMP1_rN8d0NmLwNUxn2CDP1OyYNjJmtLsVhzD24",
    category: "Home",
    title: "Barista Series Home Hub",
    priceRange: "$800 - $1,500",
  },
];

const CampaignCard: React.FC<CampaignCardProps> = ({
  image,
  category,
  title,
  priceRange,
}) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-primary-soft bg-card p-2 transition-all hover:shadow-xl">
      <div className="aspect-[16/10] overflow-hidden rounded-xl">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
            {category}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
            Active
          </span>
        </div>
        <h4 className="line-clamp-1 font-bold text-foreground transition-colors group-hover:text-primary">
          {title}
        </h4>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-black text-primary">{priceRange}</div>
          <button
            type="button"
            className="rounded-lg bg-primary/10 p-1.5 text-primary transition-colors hover:bg-primary hover:text-background-dark"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export const ActiveCampaignsSection: React.FC = () => {
  return (
    <section
      id="campaigns"
      className="bg-background-light py-24 dark:bg-background-dark/30"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="text-3xl font-black text-foreground">
            Active Campaigns
          </h2>
          <p className="mt-4 text-muted">
            High-value brand deals open for collaboration
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPAIGNS.map((campaign) => (
            <CampaignCard key={campaign.title} {...campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};

