'use client';

import { Textarea } from '@/components/ui/textarea';

import { AppField } from './field';

export const AppDescription = () => {
  return (
    <AppField name="description">
      {field => <Textarea {...field} placeholder="My App" />}
    </AppField>
  );
};
