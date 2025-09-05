import { CreditCodeMinter } from '@/components/admin/CreditCodeMinter';

export default function AdminCodesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Referral Codes</h1>
        <p className="text-muted-foreground mt-2">
          Manage and mint referral codes for users to get free credits
        </p>
      </div>

      <CreditCodeMinter />
    </div>
  );
}
