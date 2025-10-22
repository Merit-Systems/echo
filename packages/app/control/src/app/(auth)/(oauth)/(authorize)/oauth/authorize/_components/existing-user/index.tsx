import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { ConnectionBeam } from '../connection-beam';
import { Scopes } from './scopes';
import { AuthorizeButtons } from './buttons';

import type { AuthorizeParams } from '../../_actions/schema';

interface Props {
  name: string;
  profilePictureUrl: string | null;
  userImage: string | null;
  ownerName: string;
  hideOwnerName: boolean;
  scopes: string[];
  authParams: AuthorizeParams;
}

export const ExistingUserAuthorize: React.FC<Props> = ({
  name,
  profilePictureUrl,
  userImage,
  ownerName,
  hideOwnerName,
  scopes,
  authParams,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold text-foreground text-center">
        Connect to {name}
      </h1>
      <ConnectionBeam appImage={profilePictureUrl} userImage={userImage} />
      <div className="flex flex-col items-center gap-4 w-full">
        <Card className="bg-card rounded-lg border border-border shadow-lg w-full">
          {/* App Information */}
          <CardHeader className="p-4 border-b">
            <h2 className="text-lg text-foreground font-light">
              <span className="font-bold">{name}</span>
              {!hideOwnerName && (
                <>
                  {' '}
                  by <span className="font-bold">{ownerName}</span>
                </>
              )}{' '}
              wants to:
            </h2>
          </CardHeader>
          <CardContent className="p-4 border-b">
            <Scopes scopes={scopes} />
          </CardContent>
          <CardFooter className="w-full flex justify-center p-4">
            <AuthorizeButtons params={authParams} />
          </CardFooter>
        </Card>
        <p className="text-xs text-muted-foreground/60 text-center">
          Connecting your account will redirect you to:
          <br />
          <span className="font-semibold">{authParams.redirect_uri}</span>
        </p>
      </div>
    </div>
  );
};
