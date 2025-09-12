'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Smartphone, 
  CreditCard, 
  Receipt,
  Coins
} from 'lucide-react';

// Import our dashboard components
import { UserEarningsGrid } from './UserEarningsGrid';
import { AppEarningsGrid } from './AppEarningsGrid';
import { UserSpendingGrid } from './UserSpendingGrid';
import { CreditIssuanceGrid } from './CreditIssuanceGrid';
import { PaymentsGlobalGrid } from './PaymentsGlobalGrid';

export function TabbedAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive admin interface for managing users, apps, earnings, spending, and payments
        </p>
      </div>

      <Tabs defaultValue="user-earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="user-earnings" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">User Earnings</span>
            <span className="md:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="app-earnings" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden md:inline">App Earnings</span>
            <span className="md:hidden">Apps</span>
          </TabsTrigger>
          <TabsTrigger value="user-spending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">User Spending</span>
            <span className="md:hidden">Spending</span>
          </TabsTrigger>
          <TabsTrigger value="credit-issuance" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden md:inline">Credit Issuance</span>
            <span className="md:hidden">Credits</span>
          </TabsTrigger>
          <TabsTrigger value="payments-global" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden md:inline">Payments & Global</span>
            <span className="md:hidden">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
            <span className="md:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* User Earnings Tab */}
        <TabsContent value="user-earnings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Earnings
              </CardTitle>
              <CardDescription>
                View user earnings with email campaigns, total transactions, profits, referral data, and links to detailed user breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserEarningsGrid />
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Earnings Tab */}
        <TabsContent value="app-earnings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                App Earnings
              </CardTitle>
              <CardDescription>
                View app earnings with owner information, email campaigns (app and owner), transaction data, and links to detailed app breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppEarningsGrid />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Spending Tab */}
        <TabsContent value="user-spending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Spending
              </CardTitle>
              <CardDescription>
                View user spending with balance information, free tier vs personal balance usage, Stripe payments, and expandable app-by-app breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSpendingGrid />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Issuance Tab */}
        <TabsContent value="credit-issuance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                User Credit Issuance
              </CardTitle>
              <CardDescription>
                Interface for granting free credits to users and their apps, and generating arbitrary credit codes for distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreditIssuanceGrid />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments & Global Tab */}
        <TabsContent value="payments-global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payments Received + Global Spending + Global Earnings
              </CardTitle>
              <CardDescription>
                Dashboard showing credits issued by source, Stripe fees, global spending/earnings breakdowns, and detailed payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsGlobalGrid />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab - Placeholder for future implementation */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>
                Advanced analytics and reporting features (coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Advanced Analytics</p>
                  <p className="text-sm">Coming soon - Advanced reporting and analytics features</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}