import { Shield, LayoutDashboard } from 'lucide-react';
import { Breadcrumb } from '@/app/(app)/@breadcrumbs/_components/breadcrumb';

export default function AdminPayoutsBreadcrumb() {
  return (
    <>
      <Breadcrumb
        href="/admin/dashboard"
        image={null}
        name="Admin"
        Fallback={Shield}
        mobileHideText
      />
      <span className="text-muted-foreground">/</span>
      <Breadcrumb
        href="/admin/dashboard"
        image={null}
        name="Dashboard"
        Fallback={LayoutDashboard}
      />
    </>
  );
}
