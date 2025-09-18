import { Plus, Shield } from 'lucide-react';
import { Breadcrumb } from '@/app/(app)/@breadcrumbs/_components/breadcrumb';
import { Separator } from '../../_components/separator';

export default function AdminCodesBreadcrumb() {
  return (
    <>
      <Separator />
      <Breadcrumb
        href="/admin/credit-grants/overview"
        image={null}
        name="Credit Grants"
        Fallback={Shield}
        mobileHideText
      />
    </>
  );
}
