import { useEffect, useState } from 'react';
import { useEcho } from '@component-registry/registry/echo';
import { Result } from 'neverthrow'; // Import Result from neverthrow

// [NEW] Placeholder for the error type that the echo service returns.
// In a real application, this type would be defined in a shared
// client/server types module or a dedicated API types file,
// reflecting the standardized error structure across the server.
type EchoServiceError = {
  kind: 'EchoServiceError'; // A discriminant for better type safety
  message: string;
  // Specific error codes aligned with server-side expected failures (e.g., validation, auth)
  code?: 'INVALID_MESSAGE' | 'UNAUTHORIZED' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR' | string;
  details?: Record<string, any>; // Optional details for debugging or specific error info
};

export const useEchoReact = (message: string) => {
  // Assume the 'echo' object returned by useEcho provides a method 'echo'
  // that, after the server-side refactor, returns a neverthrow Result.
  // We explicitly type it here for demonstration purposes.
  const echo: { echo: (msg: string) => Promise<Result<string, EchoServiceError>> } = useEcho();

  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // [CHANGE] Update the error state type to use our new EchoServiceError
  const [error, setError] = useState<EchoServiceError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      // [CHANGE] Replaced traditional try/catch with neverthrow's Result pattern.
      // This assumes `echo.echo` has been refactored server-side (and its client wrapper)
      // to return `Result<string, EchoServiceError>` for all expected failure paths.
      const result: Result<string, EchoServiceError> = await echo.echo(message);

      if (isMounted) {
        if (result.isOk()) {
          // If the operation was successful, set the data.
          setData(result.value);
        } else {
          // If the operation failed, set the structured error.
          setError(result.error);
        }
        // [CHANGE] setLoading(false) is now handled after the Result is processed,
        // as neverthrow explicitly models success and failure as return values.
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [echo, message]);

  return { data, loading, error };
};