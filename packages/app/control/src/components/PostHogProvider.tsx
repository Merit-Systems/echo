'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    if (status === 'authenticated' && session?.user) {
      // User is logged in - identify them in PostHog
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      });
    } else if (status === 'unauthenticated') {
      // User is logged out - reset PostHog
      posthog.reset();
    }
  }, [session, status]);

  return <>{children}</>;
}
