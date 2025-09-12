import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: process.env.NODE_ENV === 'development',
  person_profiles: 'identified_only', // Only create person profiles for identified users
});

// Set global properties that will be included with every event
posthog.register({
  environment: process.env.NODE_ENV || 'unknown',
});
