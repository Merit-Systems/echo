'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Key, Loader2 } from 'lucide-react';
import { useValidApiKey } from './hooks/valid-api-key';

interface AcceptApiKeyProps {
  onApiKeySubmitted?: () => void;
}

export function AcceptApiKey({ onApiKeySubmitted }: AcceptApiKeyProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { refetch, hasValidApiKey } = useValidApiKey();

  useEffect(() => {
    if (hasValidApiKey) {
      onApiKeySubmitted?.();
    }
  }, [hasValidApiKey, onApiKeySubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setSubmitError('Please enter your API key');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });

    if (!response.ok) {
      const data = await response.json();
      setSubmitError(data.error || 'Failed to save API key');
      setIsSubmitting(false);
      return;
    }

    await refetch();
    setIsSubmitting(false);
    onApiKeySubmitted?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            API Key Required
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please add your API key to start using the chat
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Don't have an API key yet?{' '}
            <a
              href={`https://echo.merit.systems/app/${process.env.NEXT_PUBLIC_ECHO_APP_ID}/keys`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create one here
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">
                {submitError}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !apiKey.trim()}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save API Key'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
