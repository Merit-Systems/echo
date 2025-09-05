import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { api } from '@/trpc/server';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AddRedirectButton } from './add-redirect-button';

interface Props {
  redirectUri: string;
  appId: string;
  authorizedCallbackUrls: string[];
}

export const UnauthorizedRedirect: React.FC<Props> = async ({
  redirectUri,
  appId,
  authorizedCallbackUrls,
}) => {
  const isOwner = await api.apps.app.isOwner(appId);

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full flex flex-col justify-center">
        <CardHeader className="flex-row items-center gap-2">
          <AlertCircle className="size-6 text-red-500 mb-0" />
          <h1 className="text-xl font-bold text-foreground">
            Unauthorized Redirect URL
          </h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>The redirect URL of this session is not authorized</p>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Given Redirect URL:
            </p>
            <p className="bg-muted p-2 rounded-md text-muted-foreground font-mono text-sm">
              {redirectUri}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href={'/'} className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
          {isOwner && (
            <AddRedirectButton
              appId={appId}
              redirectUri={redirectUri}
              authorizedCallbackUrls={authorizedCallbackUrls}
            />
          )}
        </CardFooter>
      </Card>
      {isOwner && (
        <p className="text-xs text-muted-foreground text-center">
          Since you are the owner of this app, you can authorize this URL by
          clicking the button above. You can always change this later in the app
          settings.
        </p>
      )}
    </div>
  );
};
