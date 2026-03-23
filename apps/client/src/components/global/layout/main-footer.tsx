import React from "react";

export const MainFooter: React.FC = () => {
  return (
    <footer className="border-t border-primary-soft bg-card py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-6 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-2xl font-bold">
                hub
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                KOLConnect
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              The world&apos;s leading platform for data-driven influencer
              marketing and creator monetization.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase text-foreground">
              Platform
            </h4>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Influencers
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Brands
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Case Studies
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase text-foreground">
              Resources
            </h4>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Guides
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Community
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase text-foreground">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Careers
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Legal
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-primary-soft pt-8 md:flex-row">
          <p className="text-sm text-muted">
            © 2024 KOLConnect. All rights reserved.
          </p>
          <div className="mt-4 flex items-center gap-6 md:mt-0">
            <a
              href="#"
              className="text-muted transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined">public</span>
            </a>
            <a
              href="#"
              className="text-muted transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined">
                alternate_email
              </span>
            </a>
            <a
              href="#"
              className="text-muted transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined">link</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

