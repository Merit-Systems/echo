'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/client';
import { EchoApp } from '@/generated/prisma';
import { Search, Globe, Calendar, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface AppSearchProps {
  userId: string;
  selectedApp: EchoApp | null;
  onAppSelect: (app: EchoApp | null) => void;
}

export function AppSearch({
  userId,
  selectedApp,
  onAppSelect,
}: AppSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: apps, isLoading } = api.admin.getAppsForUser.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Filter apps based on search term
  const filteredApps = useMemo(() => {
    if (!apps || !searchTerm.trim()) return apps || [];

    const term = searchTerm.toLowerCase();
    return apps.filter(
      app =>
        app.name.toLowerCase().includes(term) ||
        app.description?.toLowerCase().includes(term) ||
        app.id.includes(term) ||
        app.homepageUrl?.toLowerCase().includes(term)
    );
  }, [apps, searchTerm]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getAppStatusBadge = (app: EchoApp) => {
    if (app.isPublic) {
      return (
        <Badge variant="default" className="text-xs">
          Public
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Private
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>This user doesn&apos;t own any apps yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search apps by name, description, or ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected App Display */}
      {selectedApp && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                  {selectedApp.profilePictureUrl ? (
                    <Image
                      src={selectedApp.profilePictureUrl}
                      alt={selectedApp.name}
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <Globe className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedApp.name}</span>
                    {getAppStatusBadge(selectedApp)}
                  </div>
                  {selectedApp.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {selectedApp.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created {formatDate(selectedApp.createdAt)}
                    </div>
                    {selectedApp.homepageUrl && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a
                          href={selectedApp.homepageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAppSelect(null)}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apps List */}
      <div className="space-y-2">
        {filteredApps.map(app => (
          <Card
            key={app.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedApp?.id === app.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onAppSelect(app)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {app.profilePictureUrl ? (
                    <Image
                      src={app.profilePictureUrl}
                      alt={app.name}
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <Globe className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{app.name}</span>
                    {getAppStatusBadge(app)}
                  </div>
                  {app.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {app.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span>ID: {app.id}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(app.createdAt)}
                    </div>
                    {app.homepageUrl && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a
                          href={app.homepageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="text-sm text-muted-foreground">
        {searchTerm
          ? `${filteredApps.length} of ${apps.length} apps`
          : `${apps.length} total apps`}
      </div>
    </div>
  );
}
