import type { SignInEventData } from '@/services/feed/types';
import { User, Users } from 'lucide-react';

interface Props {
  activity: SignInEventData;
}

export const SignInContent: React.FC<Props> = ({ activity }) => {
  return (
    <div className="flex items-center gap-1">
      {activity.total_users > 1 ? (
        <Users className="size-4" />
      ) : (
        <User className="size-4" />
      )}
      <p className="truncate">
        {activity.total_users} user{activity.total_users > 1 ? 's' : ''} signed
        in
      </p>
    </div>
  );
};
