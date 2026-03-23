import React from "react";

export const PlatformBenefitsSection: React.FC = () => {
  return (
    <section id="platform" className="bg-primary/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            How it works
          </h2>
          <h3 className="mt-4 text-4xl font-black text-foreground">
            Unlock Your Full Potential
          </h3>
          <p className="mt-4 max-w-2xl text-foreground-muted">
            Our platform simplifies the connection between influencers and
            high-impact brands, focusing on growth and authentic engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group rounded-2xl border border-primary-soft bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-background-dark">
              <span className="material-symbols-outlined text-3xl">
                psychology
              </span>
            </div>
            <h4 className="mb-3 text-xl font-bold text-foreground">
              Smart Matching
            </h4>
            <p className="text-foreground-muted">
              AI-driven brand discovery that aligns your unique audience with
              the perfect campaign partners.
            </p>
          </div>

          <div className="group rounded-2xl border border-primary-soft bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-background-dark">
              <span className="material-symbols-outlined text-3xl">
                monitoring
              </span>
            </div>
            <h4 className="mb-3 text-xl font-bold text-foreground">
              Real-time Analytics
            </h4>
            <p className="text-foreground-muted">
              Comprehensive dashboard to track your engagement, audience
              growth, and campaign ROI instantly.
            </p>
          </div>

          <div className="group rounded-2xl border border-primary-soft bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-background-dark">
              <span className="material-symbols-outlined text-3xl">
                payments
              </span>
            </div>
            <h4 className="mb-3 text-xl font-bold text-foreground">
              Secure Payments
            </h4>
            <p className="text-foreground-muted">
              Escrow-backed payments ensure you get paid on time, every time,
              as soon as milestones are met.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

