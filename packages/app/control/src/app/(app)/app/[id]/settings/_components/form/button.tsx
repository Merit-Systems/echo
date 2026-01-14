'use client';

import { useFormState } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export const FormButton = () => {
  const { isValid, isDirty } = useFormState();

  const disabled = useMemo(() => {
    return !isValid || !isDirty;
  }, [isValid, isDirty]);

  return (
    <Button type="submit" disabled={disabled}>
      Save
    </Button>
  );
};
