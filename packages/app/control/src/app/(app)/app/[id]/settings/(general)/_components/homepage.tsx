'use client';

import { Input } from '@/components/ui/input';

import { AppField } from './field';

export const AppHomepage = () => {
  return (
    <AppField name="homepageUrl">
      {field => <Input {...field} placeholder="https://example.com" />}
    </AppField>
  );
};
