import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { DisplayClient } from '@/app/display/screen-client';

export const dynamic = 'force-dynamic';

export default async function DisplayPage() {
  const isAuthorized = await isAuthenticatedAdmin();

  if (!isAuthorized) {
    redirect('/login?next=/display');
  }

  return <DisplayClient />;
}
