export type HeroVariant = "chat" | "schedule";

export type ProcessStepStatus = "done" | "active" | "pending";

export type ProcessStepDef = {
  title: string;
  desc: string;
  icon: string;
  /** True to render a bold letter (e.g. "f") instead of an icon glyph. */
  letter?: string;
  brand: string;
  ring: string;
  /** Text/icon color while this step is the active one. */
  activeColor: string;
};

export const BOT_INTRO_TEXT =
  "Chào bạn! Điền thông tin dưới đây để mình khởi tạo Hive-K cho bạn:";
export const BRAND_NAME = "Coffee House";
export const POST_TEXT =
  "Ưu đãi cuối tuần – giảm 30% toàn bộ sản phẩm, áp dụng đến Chủ Nhật.";

export const CHAT_STEPS: ProcessStepDef[] = [
  {
    title: "Điền form khởi tạo",
    desc: "Hive-K AI tự động gửi form yêu cầu",
    icon: "assignment",
    brand: "var(--color-primary)",
    ring: "rgba(245,158,11,0.22)",
    activeColor: "var(--color-background-dark)",
  },
  {
    title: "Xác nhận Facebook",
    desc: "Cho phép Hive-K quản lý trang",
    letter: "f",
    icon: "",
    brand: "#1877F2",
    ring: "rgba(24,119,242,0.22)",
    activeColor: "#fff",
  },
  {
    title: "Xác nhận Instagram",
    desc: "Cho phép Hive-K quản lý tài khoản",
    icon: "photo_camera",
    brand: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)",
    ring: "rgba(214,41,118,0.25)",
    activeColor: "#fff",
  },
  {
    title: "Hoàn tất",
    desc: "Cả 2 nền tảng đã sẵn sàng",
    icon: "task_alt",
    brand: "#22c55e",
    ring: "rgba(34,197,94,0.22)",
    activeColor: "#fff",
  },
];

export const SCHEDULE_STEPS: ProcessStepDef[] = [
  {
    title: "Nhập nội dung bài đăng",
    desc: "Nội dung, thời gian, nền tảng",
    icon: "edit_note",
    brand: "var(--color-primary)",
    ring: "rgba(245,158,11,0.22)",
    activeColor: "var(--color-background-dark)",
  },
  {
    title: "Hive-K tự động đăng bài",
    desc: "Đăng đồng thời lên các nền tảng",
    icon: "bolt",
    brand: "var(--color-primary)",
    ring: "rgba(245,158,11,0.22)",
    activeColor: "var(--color-background-dark)",
  },
  {
    title: "Thông báo hoàn tất",
    desc: "Nhận thông báo ngay trên điện thoại",
    icon: "notifications",
    brand: "#22c55e",
    ring: "rgba(34,197,94,0.22)",
    activeColor: "#fff",
  },
];

export function stepStatus(index: number, currentStep: number): ProcessStepStatus {
  const num = index + 1;
  if (num < currentStep) return "done";
  if (num === currentStep) return "active";
  return "pending";
}
