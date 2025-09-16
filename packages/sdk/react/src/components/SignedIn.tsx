import { useEcho } from '../hooks/useEcho';

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useEcho();
  if (isLoggedIn) {
    return <>{children}</>;
  }
  return null;
};
