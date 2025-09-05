export enum FeedActivityType {
  TRANSACTION = 'transaction',
  SIGNIN = 'signin',
}

export type FeedUser = {
  userId: string;
  userName: string | null;
  userProfilePicture: string | null;
};

export type FeedApp = {
  id: string;
  name: string;
  profilePictureUrl: string | null;
};

export type TransactionEventData = {
  total_transactions: number;
  total_profit: number;
};

export type SignInEventData = {
  total_users: number;
};

export type FeedActivity = {
  timestamp: Date;
  app: FeedApp;
  users: FeedUser[];
} & (
  | {
      activity_type: FeedActivityType.TRANSACTION;
      event_data: TransactionEventData;
    }
  | {
      activity_type: FeedActivityType.SIGNIN;
      event_data: SignInEventData;
    }
);
