import posthog from 'posthog-js';
import { env } from './env';

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: env.NEXT_PUBLIC_NODE_ENV === 'development',
  person_profiles: 'identified_only', // Only create person profiles for identified users
});

// Set global properties that will be included with every event
posthog.register({
  environment: env.NEXT_PUBLIC_NODE_ENV,
});
