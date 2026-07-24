'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BrowserMockup, DemoCursor } from './browser-mockup';
import { BOT_INTRO_TEXT, BRAND_NAME, CHAT_STEPS } from './hero-demo-data';
import { ProcessSteps } from './process-steps';

type Screen = 'chat' | 'facebook' | 'instagram';
type OAuthStep = 'ask' | 'done';

const ZOOM_SCALE = 1.6;

type State = {
  cursorX: number;
  cursorY: number;
  clicking: boolean;
  cursorVisible: boolean;
  zoomActive: boolean;
  screen: Screen;
  botTyping: boolean;
  chatShowAi: boolean;
  formShown: boolean;
  brandTyped: string;
  brandTypingActive: boolean;
  formComplete: boolean;
  showFinalMsg: boolean;
  fbConnected: boolean;
  igConnected: boolean;
  fbStep: OAuthStep;
  igStep: OAuthStep;
};

const INITIAL_STATE: State = {
  cursorX: 370,
  cursorY: 230,
  clicking: false,
  cursorVisible: false,
  zoomActive: false,
  screen: 'chat',
  botTyping: false,
  chatShowAi: false,
  formShown: false,
  brandTyped: '',
  brandTypingActive: false,
  formComplete: false,
  showFinalMsg: false,
  fbConnected: false,
  igConnected: false,
  fbStep: 'ask',
  igStep: 'ask',
};

const SUGGESTED_ACTIONS = [
  { icon: 'send', label: 'Đăng bài lên đa nền tảng' },
  { icon: 'schedule', label: 'Lên lịch đăng tự động' },
  { icon: 'forum', label: 'Trả lời bình luận & tin nhắn' },
  { icon: 'insights', label: 'Phân tích hiệu suất bài đăng' },
];

/**
 * Chat-first onboarding demo ("1b" in the design handoff): the AI chatbot
 * asks for a brand name, then walks the user through simulated Facebook and
 * Instagram OAuth consent screens before reporting success — mirroring the
 * timed setTimeout sequence from Canvas.dc.html's runLoop().
 */
export function ChatConnectDemo({ active }: { active: boolean; }) {
  const [state, setState] = useState<State>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const aliveRef = useRef(true);

  const patch = (next: Partial<State>) => setState((prev) => ({ ...prev, ...next }));

  const moveAndClick = (x: number, y: number, onArrive: () => void) => {
    patch({ cursorX: x, cursorY: y });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ clicking: true });
      timerRef.current = setTimeout(() => {
        if (!aliveRef.current) return;
        patch({ clicking: false });
        onArrive();
      }, 260);
    }, 560);
  };

  const typeBrand = () => {
    let i = 0;
    patch({ brandTypingActive: true });
    const step = () => {
      if (!aliveRef.current) return;
      i++;
      patch({ brandTyped: BRAND_NAME.slice(0, i) });
      if (i < BRAND_NAME.length) {
        timerRef.current = setTimeout(step, 55);
      } else {
        patch({ brandTypingActive: false });
        timerRef.current = setTimeout(() => moveAndClick(110, 256, gotoFacebook), 400);
      }
    };
    timerRef.current = setTimeout(step, 150);
  };

  const gotoFacebook = () => {
    patch({ screen: 'facebook', fbStep: 'ask', zoomActive: false });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ zoomActive: true });
      moveAndClick(414, 297, confirmFacebook);
    }, 1100);
  };
  const confirmFacebook = () => {
    patch({ fbStep: 'done' });
    timerRef.current = setTimeout(returnFromFacebook, 1200);
  };
  const returnFromFacebook = () => {
    patch({ screen: 'chat', fbConnected: true, zoomActive: false });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ zoomActive: true });
      moveAndClick(265, 256, gotoInstagram);
    }, 1100);
  };
  const gotoInstagram = () => {
    patch({ screen: 'instagram', igStep: 'ask', zoomActive: false });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ zoomActive: true });
      moveAndClick(414, 297, confirmInstagram);
    }, 1100);
  };
  const confirmInstagram = () => {
    patch({ igStep: 'done' });
    timerRef.current = setTimeout(returnFromInstagram, 1200);
  };
  const returnFromInstagram = () => {
    patch({ screen: 'chat', igConnected: true, zoomActive: false });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ zoomActive: true });
      moveAndClick(372, 336, submitComplete);
    }, 1100);
  };
  const submitComplete = () => {
    patch({ formComplete: true });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ showFinalMsg: true, zoomActive: false, cursorVisible: false });
      timerRef.current = setTimeout(runLoop, 3600);
    }, 500);
  };

  const runLoop = () => {
    setState(INITIAL_STATE);
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ botTyping: true });
      timerRef.current = setTimeout(() => {
        if (!aliveRef.current) return;
        patch({ botTyping: false, chatShowAi: true });
        timerRef.current = setTimeout(() => {
          if (!aliveRef.current) return;
          patch({ formShown: true });
          timerRef.current = setTimeout(() => {
            if (!aliveRef.current) return;
            patch({ zoomActive: true, cursorVisible: true });
            moveAndClick(240, 184, typeBrand);
          }, 500);
        }, 350);
      }, 900);
    }, 1100);
  };

  useEffect(() => {
    if (!active) return;
    aliveRef.current = true;
    runLoop();
    return () => {
      aliveRef.current = false;
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const isChat = state.screen === 'chat';
  const isFb = state.screen === 'facebook';
  const isIg = state.screen === 'instagram';

  const currentStep = state.showFinalMsg
    ? 4
    : isIg || (isChat && state.igConnected)
    ? 3
    : isFb || (isChat && state.fbConnected)
    ? 2
    : 1;

  const zoomScale = state.zoomActive ? ZOOM_SCALE : 1;
  const zoomStyle: React.CSSProperties = {
    transform: `scale(${zoomScale})`,
    transformOrigin: `${state.cursorX}px ${state.cursorY}px`,
    transition:
      'transform 0.55s cubic-bezier(.4,0,.2,1), transform-origin 0.55s cubic-bezier(.4,0,.2,1)',
    willChange: 'transform',
  };

  const fbChipStyle: React.CSSProperties = state.fbConnected
    ? {
      background: 'rgba(74,222,128,0.14)',
      color: '#4ade80',
      border: '1.5px solid rgba(74,222,128,0.35)',
    }
    : {
      background: 'rgba(255,255,255,0.06)',
      color: '#e2e8f0',
      border: '1.5px solid rgba(255,255,255,0.14)',
    };
  const igChipStyle: React.CSSProperties = state.igConnected
    ? {
      background: 'rgba(74,222,128,0.14)',
      color: '#4ade80',
      border: '1.5px solid rgba(74,222,128,0.35)',
    }
    : {
      background: 'rgba(255,255,255,0.06)',
      color: '#e2e8f0',
      border: '1.5px solid rgba(255,255,255,0.14)',
    };
  const submitStyle: React.CSSProperties = state.formComplete
    ? { background: 'rgba(74,222,128,0.16)', color: '#4ade80' }
    : { background: 'var(--color-primary)', color: 'var(--color-background-dark)' };

  const chromeLabel = isChat
    ? 'Hive-K AI · Kết nối tài khoản'
    : isFb
    ? 'facebook.com'
    : 'instagram.com';
  const chromeDotStyle: React.CSSProperties = {
    background: isChat
      ? 'var(--color-primary)'
      : isFb
      ? '#1877F2'
      : 'linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)',
  };

  return (
    <div className='flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-center'>
      <div className='w-full max-w-[400px] shrink-0 pt-1.5 text-left'>
        <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-[0.8rem] font-bold tracking-wide text-primary'>
          <span className='material-symbols-outlined text-base' aria-hidden>
            bolt
          </span>
          THIẾT LẬP TỰ ĐỘNG · MỌI NỀN TẢNG
        </div>
        <h1 className='my-3.5 text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl'>
          Trợ lý AI đăng bài khắp <span className='text-primary'>5+ nền tảng</span>
        </h1>
        <p className='mb-6 max-w-[420px] text-base leading-relaxed text-foreground-muted'>
          Một câu chat — nội dung, lịch đăng, tất cả tự động.
        </p>

        <ProcessSteps
          title='Kết nối tài khoản mạng xã hội'
          steps={CHAT_STEPS}
          currentStep={currentStep}
        />
      </div>

      <div className='flex w-full justify-center lg:w-auto lg:justify-start'>
        <BrowserMockup
          chromeLabel={chromeLabel}
          chromeDotStyle={chromeDotStyle}
          zoomStyle={zoomStyle}
        >
          {/* SCREEN: CHAT */}
          <div
            className='absolute inset-0 flex flex-col transition-opacity duration-300'
            style={{ opacity: isChat ? 1 : 0 }}
          >
            <div className='flex shrink-0 items-center gap-2.5 border-b border-white/[0.08] bg-[#141c2c] px-5 py-3.5'>
              <span className='inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-white p-[5px]'>
                <Image
                  src='/hivek-icon.png'
                  alt='Hive-K'
                  width={20}
                  height={20}
                  className='h-full w-full object-contain'
                />
              </span>
              <span className='text-sm font-bold text-white'>Hive-K AI</span>
              <span className='ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-400'>
                <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-400' />
                Đang hoạt động
              </span>
            </div>

            <div className='flex flex-1 flex-col justify-end gap-2.5 overflow-hidden p-5'>
              {state.botTyping && (
                <div className='inline-flex w-fit items-center gap-1.5 self-start rounded-2xl rounded-bl-[3px] bg-[#1e293b] px-4 py-3'>
                  <span
                    className='hk-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400'
                    style={{ animationDelay: '0s' }}
                  />
                  <span
                    className='hk-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400'
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className='hk-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400'
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              )}
              {state.chatShowAi && (
                <div className='max-w-[85%] self-start rounded-2xl rounded-bl-[3px] bg-[#1e293b] px-3.5 py-2.5 text-sm leading-relaxed text-slate-200'>
                  {BOT_INTRO_TEXT}
                </div>
              )}
              {state.formShown && (
                <div className='flex w-full max-w-[440px] flex-col gap-4 self-start rounded-2xl rounded-bl-[3px] border border-white/[0.08] bg-[#1e293b] p-4.5'>
                  <div>
                    <div className='mb-1.5 text-[0.68rem] font-bold tracking-wide text-slate-400'>
                      TÊN THƯƠNG HIỆU / TRANG
                    </div>
                    <div className='flex h-[38px] items-center overflow-hidden whitespace-nowrap rounded-lg border-[1.5px] border-white/[0.12] bg-[#0e1522] px-3 text-sm text-slate-200'>
                      {state.brandTyped}
                      {state.brandTypingActive && (
                        <span className='hk-caret ml-0.5 inline-block h-[1.05em] w-0.5 bg-white' />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1.5 text-[0.68rem] font-bold tracking-wide text-slate-400'>
                      KẾT NỐI NỀN TẢNG
                    </div>
                    <div className='flex gap-2.5'>
                      <span
                        className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[0.78rem] font-bold'
                        style={fbChipStyle}
                      >
                        <span className='inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[#1877F2] text-[0.62rem] font-black text-white'>
                          f
                        </span>
                        {state.fbConnected ? 'Đã kết nối ✓' : 'Facebook'}
                      </span>
                      <span
                        className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[0.78rem] font-bold'
                        style={igChipStyle}
                      >
                        <span className='inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[linear-gradient(45deg,#feda75,#d62976_45%,#962fbf_75%,#4f5bd5)]'>
                          <span
                            className='material-symbols-outlined text-[11px] text-white'
                            aria-hidden
                          >
                            photo_camera
                          </span>
                        </span>
                        {state.igConnected ? 'Đã kết nối ✓' : 'Instagram'}
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-end'>
                    <span
                      className='inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.82rem] font-extrabold transition-colors duration-300'
                      style={submitStyle}
                    >
                      <span className='material-symbols-outlined text-base' aria-hidden>
                        {state.formComplete ? 'check' : 'arrow_forward'}
                      </span>
                      {state.formComplete ? 'Đã hoàn tất' : 'Hoàn tất khởi tạo'}
                    </span>
                  </div>
                </div>
              )}
              {state.showFinalMsg && (
                <div className='flex w-full max-w-[440px] flex-col gap-3.5 self-start rounded-2xl rounded-bl-[3px] border border-primary/25 bg-[linear-gradient(160deg,rgba(245,158,11,0.14),rgba(30,41,59,0.7))] p-4.5'>
                  <div className='flex items-center gap-2.5'>
                    <span
                      className='material-symbols-outlined text-[28px] text-emerald-400'
                      aria-hidden
                    >
                      check_circle
                    </span>
                    <div>
                      <div className='text-sm font-extrabold text-white'>Khởi tạo thành công!</div>
                      <div className='mt-0.5 text-xs text-slate-400'>
                        Hive-K đã sẵn sàng quản lý 2 nền tảng của bạn
                      </div>
                    </div>
                  </div>
                  <div className='h-px bg-white/[0.08]' />
                  <div>
                    <div className='mb-2.5 text-[0.68rem] font-bold tracking-wide text-slate-400'>
                      BẠN CÓ THỂ THỬ NGAY
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {SUGGESTED_ACTIONS.map((action) => (
                        <span
                          key={action.label}
                          className='inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200'
                        >
                          <span
                            className='material-symbols-outlined text-[15px] text-primary'
                            aria-hidden
                          >
                            {action.icon}
                          </span>
                          {action.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex shrink-0 items-center gap-2.5 border-t border-white/[0.08] bg-[#141c2c] px-5 py-3.5'>
              <div className='flex-1 overflow-hidden whitespace-nowrap rounded-full border-[1.5px] border-white/[0.12] bg-[#0e1522] px-4 py-2.5 text-sm text-slate-500'>
                Nhập tin nhắn...
              </div>
              <span className='flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-primary text-[color:var(--color-background-dark)]'>
                <span className='material-symbols-outlined text-[18px]' aria-hidden>
                  send
                </span>
              </span>
            </div>
          </div>

          {/* SCREEN: FACEBOOK OAUTH */}
          <div
            className='absolute inset-0 flex items-center justify-center bg-[#f0f2f5] transition-opacity duration-300'
            style={{ opacity: isFb ? 1 : 0 }}
          >
            <div className='w-[420px] rounded-2xl bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)]'>
              {isFb && state.fbStep === 'ask' && (
                <div>
                  <div className='mb-4.5 flex items-center justify-center gap-3.5'>
                    <span className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-black/[0.06] bg-neutral-50 p-2'>
                      <Image
                        src='/hivek-icon.png'
                        alt='Hive-K'
                        width={36}
                        height={36}
                        className='h-full w-full object-contain'
                      />
                    </span>
                    <span
                      className='material-symbols-outlined text-[22px] text-neutral-300'
                      aria-hidden
                    >
                      link
                    </span>
                    <span className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#1877F2] text-2xl font-black text-white'>
                      f
                    </span>
                  </div>
                  <div className='mb-2 text-center text-[1.05rem] font-extrabold text-neutral-900'>
                    Hive-K muốn kết nối với Facebook
                  </div>
                  <div className='mb-5.5 text-center text-[0.82rem] leading-relaxed text-neutral-500'>
                    Ứng dụng sẽ có thể đăng bài và quản lý trang của bạn thay bạn.
                  </div>
                  <div className='flex items-center justify-center gap-2.5'>
                    <span className='rounded-lg bg-neutral-200 px-5 py-2.5 text-[0.85rem] font-bold text-neutral-900'>
                      Không
                    </span>
                    <span className='whitespace-nowrap rounded-lg bg-[#1877F2] px-6.5 py-2.5 text-[0.85rem] font-bold text-white'>
                      Có, kết nối
                    </span>
                  </div>
                </div>
              )}
              {isFb && state.fbStep === 'done' && (
                <div className='flex flex-col items-center justify-center gap-3 py-5'>
                  <span
                    className='material-symbols-outlined text-[56px] text-emerald-500'
                    aria-hidden
                  >
                    check_circle
                  </span>
                  <div className='text-[1.05rem] font-extrabold text-neutral-900'>
                    Đã kết nối với Facebook
                  </div>
                  <div className='text-[0.82rem] text-neutral-500'>Đang quay lại Hive-K…</div>
                </div>
              )}
            </div>
          </div>

          {/* SCREEN: INSTAGRAM OAUTH */}
          <div
            className='absolute inset-0 flex items-center justify-center bg-neutral-50 transition-opacity duration-300'
            style={{ opacity: isIg ? 1 : 0 }}
          >
            <div className='w-[420px] rounded-2xl bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)]'>
              {isIg && state.igStep === 'ask' && (
                <div>
                  <div className='mb-4.5 flex items-center justify-center gap-3.5'>
                    <span className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-black/[0.06] bg-neutral-50 p-2'>
                      <Image
                        src='/hivek-icon.png'
                        alt='Hive-K'
                        width={36}
                        height={36}
                        className='h-full w-full object-contain'
                      />
                    </span>
                    <span
                      className='material-symbols-outlined text-[22px] text-neutral-300'
                      aria-hidden
                    >
                      link
                    </span>
                    <span className='flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(45deg,#feda75,#d62976_45%,#962fbf_75%,#4f5bd5)]'>
                      <span
                        className='material-symbols-outlined text-[26px] text-white'
                        aria-hidden
                      >
                        photo_camera
                      </span>
                    </span>
                  </div>
                  <div className='mb-2 text-center text-[1.05rem] font-extrabold text-neutral-900'>
                    Hive-K muốn kết nối với Instagram
                  </div>
                  <div className='mb-5.5 text-center text-[0.82rem] leading-relaxed text-neutral-500'>
                    Ứng dụng sẽ có thể đăng bài và quản lý tài khoản của bạn thay bạn.
                  </div>
                  <div className='flex items-center justify-center gap-2.5'>
                    <span className='rounded-lg bg-neutral-200 px-5 py-2.5 text-[0.85rem] font-bold text-neutral-900'>
                      Không
                    </span>
                    <span className='whitespace-nowrap rounded-lg bg-[linear-gradient(45deg,#feda75,#d62976_45%,#962fbf_75%,#4f5bd5)] px-6.5 py-2.5 text-[0.85rem] font-bold text-white'>
                      Có, kết nối
                    </span>
                  </div>
                </div>
              )}
              {isIg && state.igStep === 'done' && (
                <div className='flex flex-col items-center justify-center gap-3 py-5'>
                  <span
                    className='material-symbols-outlined text-[56px] text-emerald-500'
                    aria-hidden
                  >
                    check_circle
                  </span>
                  <div className='text-[1.05rem] font-extrabold text-neutral-900'>
                    Đã kết nối với Instagram
                  </div>
                  <div className='text-[0.82rem] text-neutral-500'>Đang quay lại Hive-K…</div>
                </div>
              )}
            </div>
          </div>

          <DemoCursor
            x={state.cursorX}
            y={state.cursorY}
            visible={state.cursorVisible}
            clicking={state.clicking}
          />
        </BrowserMockup>
      </div>
    </div>
  );
}
