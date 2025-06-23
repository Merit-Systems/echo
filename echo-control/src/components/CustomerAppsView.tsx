'use client';

import Link from 'next/link';
import { ActivityIcon } from 'lucide-react';
import { AppRole } from '@/lib/permissions/types';

interface EchoAppWithRole {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  totalTokens: number;
  totalCost: number;
  userRole: AppRole;
  permissions?: unknown;
  _count: {
    apiKeys: number;
    llmTransactions: number;
  };
}

interface CustomerAppsViewProps {
  apps: EchoAppWithRole[];
  onRefresh?: () => void;
}

export default function CustomerAppsView({ apps }: CustomerAppsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Apps You&apos;re Using
          </h2>
          <p className="text-sm text-muted-foreground">
            Applications where you have customer access
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {apps.length} {apps.length === 1 ? 'app' : 'apps'}
        </span>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-card-foreground">
            No customer apps
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t been invited to use any apps yet.
          </p>
          <div className="mt-6">
            <Link
              href="/marketplace"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              Discover Apps in Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {app.name}
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {app.userRole === AppRole.ADMIN ? 'Admin' : 'Customer'}
                </span>
              </div>

              {app.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {app.description}
                </p>
              )}

              {/* Personal Stats */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your API Keys:</span>
                  <span className="text-foreground">{app._count.apiKeys}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Your Transactions:
                  </span>
                  <span className="text-foreground">
                    {app._count.llmTransactions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Your Total Cost:
                  </span>
                  <span className="text-foreground">
                    ${app.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
