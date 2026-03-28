import Link from "next/link";
import React from "react";
import { HeroSlideshowSlot } from "@/components/global/sections/hero-slideshow-slot";
import { AUTH_ROUTES } from "@/features/auth/constants";

export const HeroSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            KOL Marketing Thế Hệ Mới
          </div>
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-foreground md:text-7xl">
            Nâng tầm nền kinh tế <span className="text-primary">Sáng tạo</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground-muted">
            Nền tảng toàn diện dành cho KOL và Nhãn hàng. Mở rộng tầm ảnh hưởng
            với cơ chế ghép đôi AI thông minh, phân tích thời gian thực và thanh
            toán an toàn liền mạch.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={AUTH_ROUTES.SIGN_IN}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-background-dark transition-all hover:bg-primary/90"
            >
              Tham gia ngay
              <span className="material-symbols-outlined" aria-hidden>
                trending_up
              </span>
            </Link>
            <button className="rounded-xl border border-primary-soft px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-primary-soft">
              Xem Demo
            </button>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              <img
                className="h-10 w-10 rounded-full border-2 border-background-light object-cover dark:border-background-dark"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsRrzUuWDirEMwF2OltbobKUmxhouU1JE0gUja5_5L3Cx9rHIPDiT8J8vatWP6FyhL45QOMUDBwHhCcAiGRZ49WPTbAlarbcB8VGtJnOx9idTtyZuwwLD0Q8e7AwU8ZFjkzyCrMjVZCKPsEGtOLoIXTLt1hhUezRcwH4kr6DjBrlo4ioj8TqMt67C01LUFeKKKMgjZGlGL09l9EkoaRAPOvvncCjenjAxf67pQg5Tzn93O1EAEEsJbVms-IpeI4wpmtG8vjOuC0IA"
                alt="Profile photo of a female creator"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-background-light object-cover dark:border-background-dark"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3wPI_w6boxlZHqAxKr3rx7usXp6Jj-7shD3vr6as4joCWfYJYf-RPPa0Mtg8w4LvQVEaRH4bfEHufPMTL9R2jS7xPfcgtnlceN_XNG2lmcaaWkDyU9QeOWbgtyo0prp1b28nsyND-Vsjt23Wc1boeWg6O6Mh5Tf5c5uTJmOzIEnr0UXQPBit6rGVRbKc112hQyqxzsT9jQ1vvDoiuI3U_gqSEN_Io7tU-WwEd_ynCA7tgj9yxF6b-96C8eGFvV8XBm9U_OFRX9IU"
                alt="Profile photo of a male creator"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-background-light object-cover dark:border-background-dark"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCABOfn3xiIF__XjH2_d81iMywHnmbE8d3MK78PFJsS0H4CCK7QezWCvlK4gc4o5Ahp08Eyo1pWET3qinqjePu7J72fef67QOsWZzy2Xl1IAzsE48d4GN8yrqV63C9YR_15woT9xdKmsGDPiZaUvRXC6g2YHeYWenNUC3cQvmqqj8OzHBWQjz1q44Oun3f_taZ19zhCXLsdKc47Wu-oZwb19WaIrXhrh-raTm1ZXgCAQLHkh4AIPwD5p-_1cTsEncmv3dgAGLInVVM"
                alt="Profile photo of a young influencer"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background-light bg-primary text-[10px] font-bold text-background-dark dark:border-background-dark">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium text-muted">
              Được tin dùng bởi hơn 2,000 creators toàn cầu
            </p>
          </div>
        </div>

        <HeroSlideshowSlot />
      </div>
    </section>
  );
};

