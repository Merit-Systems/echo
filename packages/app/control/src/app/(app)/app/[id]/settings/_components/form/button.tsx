'use client';

import { useFormState } from 'react-hook-form';

import { Button } from '@/components/ui/button';

export const FormButton = () => {
  const form = useFormState();

  return (
    <Button type="submit" disabled={!form.isValid || !form.isDirty}>
      Save
    </Button>
  );
};
