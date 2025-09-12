'use client';

import { Input } from '@/components/ui/input';

import { AppField } from './field';

export const AppName = () => {
  return (
    <AppField name="name">
      {field => <Input {...field} placeholder="My App" />}
    </AppField>
  );
};
