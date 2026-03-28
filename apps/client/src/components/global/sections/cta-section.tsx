import React from "react";

export const CallToActionSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-background-dark p-8 text-center text-on-dark md:p-16">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[80px]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="text-4xl font-black md:text-5xl">
            Sẵn sàng đưa tầm ảnh hưởng của bạn lên tầm cao mới?
          </h2>
          <p className="mt-6 text-lg text-on-dark-muted">
            Gia nhập cộng đồng creator ưu tú và bắt đầu xây dựng quan hệ đối tác thương hiệu ý nghĩa ngay hôm nay.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-primary px-10 py-4 text-lg font-bold text-background-dark transition-all hover:bg-primary/90">
              Bắt đầu miễn phí
            </button>
            <button className="rounded-xl border border-on-dark-10 bg-on-dark-10 px-10 py-4 text-lg font-bold text-on-dark transition-all hover:bg-on-dark-20">
              Liên hệ kinh doanh
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

