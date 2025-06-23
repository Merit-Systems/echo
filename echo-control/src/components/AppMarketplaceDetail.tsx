'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  Key,
  ExternalLink,
  CheckCircle,
  Plus,
  Github,
  User,
  DollarSign,
  Clock,
} from 'lucide-react';
import { GlassButton } from './glass-button';

interface DetailedApp {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // Custom image URL
  appUrl?: string; // Custom app URL
  createdAt: string;
  markup: number;
  githubId?: string;
  githubType?: string;
  memberCount: number;
  transactionCount: number;
  apiKeyCount: number;
  recentTransactions: number;
  totalRevenue: number;
  userMembership: {
    id: string;
    role: string;
    status: string;
    totalSpent: number;
    createdAt: string;
  } | null;
  owner: {
    name: string;
    email: string;
  } | null;
}

interface AppMarketplaceDetailProps {
  app: DetailedApp;
  onJoinApp: (appId: string) => Promise<void>;
  isJoining?: boolean;
}

export default function AppMarketplaceDetail({
  app,
  onJoinApp,
  isJoining = false,
}: AppMarketplaceDetailProps) {
  const isAlreadyMember = app.userMembership !== null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const getActivityLevel = () => {
    if (app.recentTransactions > 1000)
      return { level: 'High', color: 'text-green-600' };
    if (app.recentTransactions > 100)
      return { level: 'Medium', color: 'text-yellow-600' };
    if (app.recentTransactions > 0)
      return { level: 'Low', color: 'text-orange-600' };
    return { level: 'Inactive', color: 'text-gray-600' };
  };

  const activity = getActivityLevel();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - App Image/Logo Area */}
          <div className="space-y-6">
            {/* App Visual */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center border border-border">
              {app.imageUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
                  <img
                    src={app.imageUrl}
                    alt={app.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      // Fallback to default icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Activity className="h-10 w-10 text-primary" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-10 w-10 text-primary" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {app.name}
              </h1>
              {isAlreadyMember && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Member since {formatDate(app.userMembership!.createdAt)}
                </span>
              )}
              {/* Custom App URL Link */}
              {app.appUrl && (
                <div className="mt-4">
                  <a
                    href={app.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit App Website
                  </a>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {app.memberCount}
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <Activity className="h-5 w-5 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {app.transactionCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Transactions
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <DollarSign className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(app.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Volume
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <Clock className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${activity.color}`}>
                  {activity.level}
                </div>
                <div className="text-sm text-muted-foreground">Activity</div>
              </div>
            </div>
          </div>

          {/* Right Column - App Details */}
          <div className="space-y-6">
            {/* App Description */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                About this App
              </h2>
              {app.description ? (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {app.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic mb-4">
                  No description available for this application.
                </p>
              )}

              {/* App Metadata */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created
                  </span>
                  <span className="text-sm text-foreground">
                    {formatDate(app.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Markup
                  </span>
                  <span className="text-sm text-foreground">
                    {((app.markup - 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    Active API Keys
                  </span>
                  <span className="text-sm text-foreground">
                    {app.apiKeyCount}
                  </span>
                </div>
                {app.owner && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Created by
                    </span>
                    <span className="text-sm text-foreground">
                      {app.owner.name}
                    </span>
                  </div>
                )}
                {app.githubId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </span>
                    <a
                      href={`https://github.com/${app.githubId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      {app.githubId}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
              {isAlreadyMember ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      You're a member!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You've spent{' '}
                      {formatCurrency(app.userMembership!.totalSpent)} using
                      this app
                    </p>
                  </div>
                  <GlassButton
                    variant="primary"
                    className="w-full flex items-center justify-center"
                    onClick={() => (window.location.href = `/apps/${app.id}`)}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Go to App Dashboard
                  </GlassButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Plus className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ready to get started?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join this app to start using AI services with a{' '}
                      {((app.markup - 1) * 100).toFixed(1)}% markup
                    </p>
                  </div>
                  <GlassButton
                    variant="primary"
                    className="w-full flex items-center justify-center"
                    onClick={() => onJoinApp(app.id)}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Join App
                      </>
                    )}
                  </GlassButton>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll become a customer and can generate API keys
                    immediately
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Performance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {app.memberCount}
            </div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {app.transactionCount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Transactions
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {app.recentTransactions}
            </div>
            <div className="text-sm text-muted-foreground">Last 30 Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(app.totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
        </div>
      </div>
    </div>
  );
}
