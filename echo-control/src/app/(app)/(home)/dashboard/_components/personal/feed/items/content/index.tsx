import { TransactionContent } from './transactions';
import { SignInContent } from './sign-in';

import type { FeedActivity} from '@/services/feed/types';
import { FeedActivityType } from '@/services/feed/types';

interface Props {
  activity: FeedActivity;
}

export const ItemContent: React.FC<Props> = ({ activity }) => {
  switch (activity.activity_type) {
    case FeedActivityType.TRANSACTION:
      return (
        <TransactionContent
          numUsers={activity.users.length}
          activity={activity.event_data}
        />
      );
    case FeedActivityType.SIGNIN:
      return <SignInContent activity={activity.event_data} />;
  }
};
