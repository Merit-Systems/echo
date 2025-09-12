'use client';

import { useState } from 'react';
import { UserSearch } from './UserSearch';
import { AppSearch } from './AppSearch';
import { CreditMinter } from './CreditMinter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  UserEarningsTable,
  UserSpendingTable,
} from '@/app/(app)/admin/_components';
import { AppEarningsTable } from '@/app/(app)/admin/_components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, EchoApp } from '@/generated/prisma';

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApp, setSelectedApp] = useState<EchoApp | null>(null);
  const [activeTab, setActiveTab] = useState('user');
  const [userSubTab, setUserSubTab] = useState('apps');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
        <TabsTrigger value="app-earnings">Apps</TabsTrigger>
        <TabsTrigger value="spending">Spending</TabsTrigger>
        <TabsTrigger value="user">User</TabsTrigger>
      </TabsList>

      <TabsContent value="user">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Search and select users to manage their credits and view their
              apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
            />
          </CardContent>
        </Card>

        <Tabs value={userSubTab} onValueChange={setUserSubTab}>
          <TabsList>
            <TabsTrigger value="apps" disabled={!selectedUser}>
              Apps
            </TabsTrigger>
            <TabsTrigger value="mint" disabled={!selectedUser}>
              Mint
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps">
            {selectedUser ? (
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>User not selected</CardTitle>
                  <CardDescription>
                    Select a user above to view this section.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mint">
            {selectedUser ? (
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>User not selected</CardTitle>
                  <CardDescription>
                    Select a user above to view this section.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="earnings">
        <UserEarningsTable />
      </TabsContent>

      <TabsContent value="app-earnings">
        <AppEarningsTable />
      </TabsContent>

      <TabsContent value="spending">
        <UserSpendingTable />
      </TabsContent>
    </Tabs>
  );
}
