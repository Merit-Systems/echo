import { useEcho } from '../hooks/useEcho';

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useEcho();
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return null;
};
