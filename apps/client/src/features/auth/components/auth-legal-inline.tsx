import Link from "next/link";

type AuthLegalInlineProps = {
  className?: string;
};

/** Liên kết pháp lý — placeholder `#` cho đến khi có route thật. */
export function AuthLegalInline({ className }: AuthLegalInlineProps) {
  return (
    <p className={className}>
      Bằng việc đăng nhập, bạn đồng ý với{" "}
      <Link
        href="/terms"
        className="text-[var(--color-tech-blue)] underline underline-offset-2 hover:opacity-90"
      >
        Điều khoản dịch vụ
      </Link>{" "}
      và{" "}
      <Link
        href="/privacy"
        className="text-[var(--color-tech-blue)] underline underline-offset-2 hover:opacity-90"
      >
        Chính sách quyền riêng tư
      </Link>{" "}
      của KOLConnect.
    </p>
  );
}
