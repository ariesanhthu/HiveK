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
                Hive-K
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Nền tảng hàng đầu về marketing kết hợp KOL dựa trên dữ liệu,
              giúp các nhãn hàng và người sáng tạo kết nối hiệu quả.
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="mb-6 text-sm font-bold uppercase text-foreground">
              Nền tảng
            </h4>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  KOLs & Creator
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Nhãn hàng & Doanh nghiệp
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="/kol-ranking">
                  Bảng xếp hạng KOL
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="mb-6 text-sm font-bold uppercase text-foreground">
              Hỗ trợ
            </h4>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-primary-soft pt-8 md:flex-row">
          <p className="text-sm text-muted">
            © 2024 Hive-K. Đã đăng ký bản quyền.
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

