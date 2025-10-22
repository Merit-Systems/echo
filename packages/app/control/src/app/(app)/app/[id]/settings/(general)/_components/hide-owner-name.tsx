'use client';

import { AppField } from './field';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const AppHideOwnerName = () => {
  return (
    <AppField name="hideOwnerName">
      {field => (
        <div className="flex items-center gap-2">
          <Switch
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
          />
          <Label>
            {field.value
              ? 'Owner name hidden on authorization page'
              : 'Owner name shown on authorization page'}
          </Label>
        </div>
      )}
    </AppField>
  );
};
