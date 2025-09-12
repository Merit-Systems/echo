import { SignInEventData } from '@/services/feed/types';

interface Props {
  activity: SignInEventData;
}

export const SignInContent: React.FC<Props> = ({ activity }) => {
  return (
    <p>
      {activity.total_users} user{activity.total_users > 1 ? 's' : ''} signed in
    </p>
  );
};
