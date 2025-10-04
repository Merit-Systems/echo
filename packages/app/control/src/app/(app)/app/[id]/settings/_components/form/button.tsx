'use client';

import { useFormState } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export const FormButton = () => {
  const form = useFormState();

  const disabled = useMemo(() => {
    return !form.isValid || !form.isDirty;
  }, [form.isValid, form.isDirty]);

  return (
    <Button type="submit" disabled={disabled}>
      Save
    </Button>
  );
};
