import { SignInForm } from '@/features/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập | Hive-K',
  description: 'Đăng nhập workspace doanh nghiệp hoặc KOL trên Hive-K.',
};

export default function SignInPage() {
  return <SignInForm />;
}
