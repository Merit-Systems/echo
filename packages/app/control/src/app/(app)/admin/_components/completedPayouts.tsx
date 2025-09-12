'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';

type Props = {
  pageSize?: number;
};

export function CompletedPayoutsTable({ pageSize = 10 }: Props) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } =
    api.admin.payouts.listCompleted.useQuery({
      cursor: page,
      page_size: pageSize,
    });

  if (isLoading) return <div>Loading completed payouts...</div>;

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
    transactionId: string | null;
    senderAddress: string | null;
  }>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Completed Payouts</h2>
        {isFetching && (
          <span className="text-sm text-muted-foreground">Refreshing…</span>
        )}
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
              <th className="p-3">Tx Hash</th>
              <th className="p-3">Sender</th>
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
                  {p.transactionId ? (
                    <span className="font-mono text-xs break-all">
                      {p.transactionId}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">
                  {p.senderAddress ? (
                    <span className="font-mono text-xs break-all">
                      {p.senderAddress}
                    </span>
                  ) : (
                    '—'
                  )}
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
