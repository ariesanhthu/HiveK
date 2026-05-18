import React from "react";

export const PlatformBenefitsSection: React.FC = () => {
  return (
    <section id="platform" className="bg-[#fdf9f3] py-24 dark:bg-background-dark/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            Cách thức hoạt động
          </h2>
          <h3 className="mt-4 text-4xl font-black text-foreground sm:text-5xl">
            Khai phá tiềm năng của bạn
          </h3>
          <p className="mt-4 max-w-2xl text-foreground-muted">
            Chúng tôi đơn giản hóa việc kết nối giữa KOL và các thương hiệu hàng đầu, tập trung vào tăng trưởng và tương tác thực chất.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group rounded-[2rem] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-card">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined text-[28px]">
                psychology
              </span>
            </div>
            <h4 className="mb-4 text-[22px] font-bold text-foreground">
              Ghép đôi thông minh
            </h4>
            <p className="text-base leading-relaxed text-foreground-muted">
              AI gợi ý thương hiệu phù hợp với tệp khán giả riêng của bạn để tạo nên các chiến dịch hoàn hảo.
            </p>
          </div>

          <div className="group rounded-[2rem] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-card">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined text-[28px]">
                monitoring
              </span>
            </div>
            <h4 className="mb-4 text-[22px] font-bold text-foreground">
              Phân tích thời gian thực
            </h4>
            <p className="text-base leading-relaxed text-foreground-muted">
              Bảng điều khiển toàn diện giúp theo dõi lượng tương tác, sự phát triển khán giả và ROI chiến dịch ngay lập tức.
            </p>
          </div>

          <div className="group rounded-[2rem] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-card">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined text-[28px]">
                payments
              </span>
            </div>
            <h4 className="mb-4 text-[22px] font-bold text-foreground">
              Thanh toán an toàn
            </h4>
            <p className="text-base leading-relaxed text-foreground-muted">
              Hệ thống thanh toán đảm bảo (escrow) giúp bạn nhận tiền đúng hạn ngay khi đạt đủ mốc yêu cầu của chiến dịch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

