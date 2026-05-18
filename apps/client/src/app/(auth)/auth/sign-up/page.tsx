import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng ký | Hive-K",
  description: "Tạo tài khoản thương hiệu hoặc creator trên Hive-K.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
