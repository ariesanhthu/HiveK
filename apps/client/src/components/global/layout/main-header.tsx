'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

/** Ignore tiny scroll jitter (trackpad inertia) below this delta. */
const SCROLL_DELTA = 8;
/** Never hide while still near the top of the page. */
const TOP_OFFSET = 80;

/**
 * Auto-hide on scroll: hidden while scrolling down (content gets the full
 * viewport), revealed on any scroll up or near the top.
 */
function useAutoHideHeader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < TOP_OFFSET) {
          setHidden(false);
        } else if (delta > SCROLL_DELTA) {
          setHidden(true);
        } else if (delta < -SCROLL_DELTA) {
          setHidden(false);
        }
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}

export const MainHeader: React.FC = () => {
  const hidden = useAutoHideHeader();
  // Every public page (incl. the landing hero) now uses the light theme, so
  // the glass nav always renders its light variant.
  const isDarkHero = false;

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full p-4 transition-transform duration-300 ease-out sm:p-6 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className={`nav-shell ${isDarkHero ? '' : 'nav-shell-light'}`}>
        <div className='flex items-center gap-8'>
          <Link href='/' className='flex items-center gap-2'>
            <span
              className={`flex items-center rounded-lg ${isDarkHero ? 'bg-white px-2 py-1' : ''}`}
            >
              <Image
                src='/logo.png'
                alt='Hive-K Logo'
                width={120}
                height={40}
                className='h-6 w-auto'
                priority
              />
            </span>
          </Link>

          <nav className='hidden items-center gap-8 md:flex'>
            <Link href='/#feature-showcase' className='nav-link'>
              Dịch vụ
            </Link>

            {
              /* <Link href="/#influencers" className="nav-link">
              KOLs
            </Link> */
            }

            <Link href='/#campaigns' className='nav-link'>
              Chiến dịch
            </Link>

            {
              /* <Link href="/kol-ranking" className="nav-link">
              Xếp hạng
            </Link> */
            }

            <Link href='/pricing' className='nav-link'>
              Bảng giá
            </Link>
          </nav>
        </div>

        <div className='flex items-center gap-4'>
          <div className='nav-search'>
            <span className='material-symbols-outlined nav-search-icon'>
              search
            </span>

            <input
              type='text'
              placeholder='Tìm kiếm creator...'
              className='nav-search-input'
            />
          </div>

          <Link href='/auth/sign-in' className='btn-primary'>
            Bắt đầu
          </Link>
        </div>
      </div>
    </header>
  );
};
