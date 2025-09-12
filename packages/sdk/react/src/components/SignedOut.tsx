import { useEcho } from '../hooks/useEcho';

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { user, rawUser } = useEcho();
  if (!user || !rawUser) {
    return <>{children}</>;
  }

  return null;
};
