import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng ký | KOLConnect",
  description: "Tạo tài khoản thương hiệu hoặc creator trên KOLConnect.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
