import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { LoginForm } from '@/app/login/login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const isAuthorized = await isAuthenticatedAdmin();
  const params = await searchParams;
  const next = params.next ?? '/admin';

  if (isAuthorized) {
    redirect(next);
  }

  return <LoginForm next={next} />;
}
