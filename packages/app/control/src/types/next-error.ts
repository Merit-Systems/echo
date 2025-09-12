type NextError = Error & { digest?: string };

export type NextErrorProps = {
  error: NextError;
  reset: () => void;
};
