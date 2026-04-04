import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { AdminPanelClient } from '@/app/admin/panel-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuthorized = await isAuthenticatedAdmin();

  if (!isAuthorized) {
    redirect('/login?next=/admin');
  }

  return <AdminPanelClient />;
}
