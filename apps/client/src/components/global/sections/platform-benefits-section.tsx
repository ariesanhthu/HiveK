import React from "react";

export const PlatformBenefitsSection: React.FC = () => {
  return (
    <section id="platform" className="bg-primary/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            Cách thức hoạt động
          </h2>
          <h3 className="mt-4 text-4xl font-black text-foreground">
            Khai phá tiềm năng của bạn
          </h3>
          <p className="mt-4 max-w-2xl text-foreground-muted">
            Chúng tôi đơn giản hóa việc kết nối giữa KOL và các thương hiệu hàng đầu, tập trung vào tăng trưởng và tương tác thực chất.
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
              Ghép đôi thông minh
            </h4>
            <p className="text-foreground-muted">
              AI gợi ý thương hiệu phù hợp với tệp khán giả riêng của bạn để tạo nên các chiến dịch hoàn hảo.
            </p>
          </div>

          <div className="group rounded-2xl border border-primary-soft bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-background-dark">
              <span className="material-symbols-outlined text-3xl">
                monitoring
              </span>
            </div>
            <h4 className="mb-3 text-xl font-bold text-foreground">
              Phân tích thời gian thực
            </h4>
            <p className="text-foreground-muted">
              Bảng điều khiển toàn diện giúp theo dõi lượng tương tác, sự phát triển khán giả và ROI chiến dịch ngay lập tức.
            </p>
          </div>

          <div className="group rounded-2xl border border-primary-soft bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-background-dark">
              <span className="material-symbols-outlined text-3xl">
                payments
              </span>
            </div>
            <h4 className="mb-3 text-xl font-bold text-foreground">
              Thanh toán an toàn
            </h4>
            <p className="text-foreground-muted">
              Hệ thống thanh toán đảm bảo (escrow) giúp bạn nhận tiền đúng hạn ngay khi đạt đủ mốc yêu cầu của chiến dịch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

