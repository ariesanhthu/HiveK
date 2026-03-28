import type { Metadata } from "next";
import { SignInForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng nhập | KOLConnect",
  description: "Đăng nhập workspace doanh nghiệp hoặc KOL trên KOLConnect.",
};

export default function SignInPage() {
  return <SignInForm />;
}
