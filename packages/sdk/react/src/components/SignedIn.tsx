import { useEcho } from '../hooks/useEcho';

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { user, rawUser } = useEcho();
  if (user && rawUser) {
    return <>{children}</>;
  }
  return null;
};
