import { ExternalLink, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';

interface AppHomepageCardProps {
  app: PublicEchoApp | CustomerEchoApp | OwnerEchoApp;
  title?: string;
}

export function AppHomepageCard({
  app,
  title = 'Homepage',
}: AppHomepageCardProps) {
  if (!app.homepageUrl) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-center py-8">
            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No homepage URL configured
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {app.name}&apos;s Homepage
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {app.homepageUrl}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              app.homepageUrl && window.open(app.homepageUrl, '_blank')
            }
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Visit Homepage
            <ArrowUpRight className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
