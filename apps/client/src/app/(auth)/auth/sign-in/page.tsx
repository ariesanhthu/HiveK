import type { Metadata } from "next";
import { SignInForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng nhập | Hive-K",
  description: "Đăng nhập workspace doanh nghiệp hoặc KOL trên Hive-K.",
};

export default function SignInPage() {
  return <SignInForm />;
}
