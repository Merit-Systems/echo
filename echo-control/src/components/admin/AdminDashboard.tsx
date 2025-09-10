'use client';

import { useState } from 'react';
import { UserSearch } from './UserSearch';
import { AppSearch } from './AppSearch';
import { CreditMinter } from './CreditMinter';
import { UsersCsvDownload } from './UsersCsvDownload';
import {
  UserEarningsTable,
  UserSpendingTable,
} from '@/app/(app)/admin/_components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { User, EchoApp } from '@/generated/prisma';

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApp, setSelectedApp] = useState<EchoApp | null>(null);

  return (
    <div className="grid gap-6">
      {/* User Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Search and select users to manage their credits and view their apps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSearch
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
        </CardContent>
      </Card>

      {/* App Search Section - Only shown when user is selected */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Apps</CardTitle>
            <CardDescription>
              Apps owned by {selectedUser.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppSearch
              userId={selectedUser.id}
              selectedApp={selectedApp}
              onAppSelect={setSelectedApp}
            />
          </CardContent>
        </Card>
      )}

      {/* Credit Minting Section - Only shown when user is selected */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Mint Credits</CardTitle>
            <CardDescription>
              Issue credits to {selectedUser.email}
              {selectedApp && ` for app "${selectedApp.name}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreditMinter user={selectedUser} selectedApp={selectedApp} />
          </CardContent>
        </Card>
      )}

      {/* Users CSV Download Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Users</CardTitle>
          <CardDescription>
            Download a CSV file of users created after a specific date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersCsvDownload />
        </CardContent>
      </Card>

      {/* User Earnings Section */}
      <UserEarningsTable />

      {/* User Spending Section */}
      <UserSpendingTable />
    </div>
  );
}
