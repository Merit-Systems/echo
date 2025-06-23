'use client';

import { Store, Users, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { GlassButton } from './glass-button';

interface MarketplaceApp {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // Custom image URL
  appUrl?: string; // Custom app URL
  createdAt: string;
  markup: number;
  memberCount: number;
  transactionCount: number;
  userMembership: {
    id: string;
    role: string;
    status: string;
  } | null;
}

interface MarketplaceViewProps {
  apps: MarketplaceApp[];
  onRefresh?: () => void;
}

export default function MarketplaceView({ apps }: MarketplaceViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Store className="h-5 w-5 mr-2" />
            App Marketplace
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover and join Echo applications
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {apps.length} {apps.length === 1 ? 'app' : 'apps'} available
        </span>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm rounded-2xl border border-border/50">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No apps available yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The marketplace is just getting started. Check back soon for
            exciting new AI applications to discover and join.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => {
            const isAlreadyMember = app.userMembership !== null;

            return (
              <div
                key={app.id}
                className="group relative bg-gradient-to-br from-card to-card/95 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Status Badge */}
                {isAlreadyMember && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="flex items-center px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 backdrop-blur-sm rounded-full border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Joined
                    </span>
                  </div>
                )}

                {/* App Icon & Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center mb-4">
                    {app.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={app.imageUrl}
                          alt={app.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            // Fallback to default icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove(
                              'hidden'
                            );
                          }}
                        />
                        <div className="hidden w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                        {app.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {app.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 h-10 overflow-hidden">
                      {app.description}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center justify-between">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">
                          {app.memberCount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Members
                      </p>
                    </div>
                    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                      <div className="flex items-center justify-between">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-foreground">
                          {app.transactionCount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Transactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Markup Badge */}
                <div className="px-6 pb-4">
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 text-xs font-medium rounded-full border border-yellow-500/20">
                    {((app.markup - 1) * 100).toFixed(1)}% markup
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 mt-auto">
                  {isAlreadyMember ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          (window.location.href = `/marketplace/apps/${app.id}`)
                        }
                        className="px-4 py-2.5 text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-background hover:text-foreground transition-all duration-200 hover:scale-105"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = `/apps/${app.id}`)
                        }
                        className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary/90 rounded-lg hover:from-primary/90 hover:to-primary transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/25 flex items-center justify-center"
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Open App
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        (window.location.href = `/marketplace/apps/${app.id}`)
                      }
                      className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary/90 rounded-lg hover:from-primary/90 hover:to-primary transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/25 flex items-center justify-center"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Details & Join
                    </button>
                  )}
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
