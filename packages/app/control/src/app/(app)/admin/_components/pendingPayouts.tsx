'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';

type Props = {
  pageSize?: number;
};

export function PendingPayoutsTable({ pageSize = 10 }: Props) {
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch, isFetching } =
    api.admin.payouts.listPending.useQuery({
      cursor: page,
      page_size: pageSize,
    });

  const startCheckout = api.admin.payouts.startMeritCheckout.useMutation();
  const pollCheckout = api.admin.payouts.pollMeritCheckout.useMutation({
    onSuccess: res => {
      if (res?.completed) {
        refetch();
      }
    },
  });
  const syncPending = api.admin.payouts.syncPending.useMutation({
    onSuccess: () => refetch(),
  });

  const handleStartCheckout = async (payoutId: string) => {
    const { url } = await startCheckout.mutateAsync({ payoutId });
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    await pollCheckout.mutateAsync({ payoutId });
  };

  if (isLoading) return <div>Loading pending payouts...</div>;

  const payouts = (data?.items ?? []) as Array<{
    id: string;
    amount: number;
    createdAt: string;
    type: string;
    userEmail: string | null;
    userName: string | null;
    echoAppName: string | null;
    recipientGithubUrl: string | null;
    recipientAddress: string | null;
  }>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Payouts</h2>
        <div className="flex items-center gap-3">
          {(isFetching ||
            startCheckout.isPending ||
            pollCheckout.isPending ||
            syncPending.isPending) && (
            <span className="text-sm text-muted-foreground">Refreshing…</span>
          )}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => syncPending.mutateAsync()}
            disabled={syncPending.isPending}
          >
            Sync Pending Payouts
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">User</th>
              <th className="p-3">App</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="p-3 capitalize">{p.type}</td>
                <td className="p-3">${p.amount.toFixed(2)}</td>
                <td className="p-3">
                  {p.userEmail ? (
                    <div className="flex flex-col">
                      <span>{p.userName ?? '—'}</span>
                      <span className="text-muted-foreground">
                        {p.userEmail}
                      </span>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">{p.echoAppName ?? '—'}</td>
                <td className="p-3">
                  {p.recipientGithubUrl ? (
                    <a
                      href={p.recipientGithubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      GitHub Link
                    </a>
                  ) : (
                    (p.recipientAddress ?? '—')
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleStartCheckout(p.id)}
                    className="px-3 py-1 border rounded self-start disabled:opacity-50"
                    disabled={startCheckout.isPending || pollCheckout.isPending}
                  >
                    Open Checkout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <div className="text-sm">
          Page {page + 1}
          {data?.has_next ? ' (more available)' : ''}
        </div>
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setPage(p => (data?.has_next ? p + 1 : p))}
          disabled={!data?.has_next}
        >
          Next
        </button>
      </div>
    </div>
  );
}
