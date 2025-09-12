'use client';

import { useState } from 'react';

import { CornerDownLeft, X } from 'lucide-react';

import { useFormContext } from 'react-hook-form';

import z from 'zod';

import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const AuthorizedCallbackUrlsInput = () => {
  const form = useFormContext();

  const [input, setInput] = useState<string>('');

  return (
    <FormField
      control={form.control}
      name="authorizedCallbackUrls"
      render={({ field }) => {
        const handleAddUrl = (url: string) => {
          if (!z.url().safeParse(url).success) {
            toast.error('Invalid URL');
            return;
          }

          if (field.value.includes(url)) {
            toast.error('URL already added');
            return;
          }
          field.onChange([...field.value, url]);
          setInput('');
        };

        const handleRemoveUrl = (url: string) => {
          field.onChange(field.value.filter((u: string) => u !== url));
        };

        return (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="https://example.com/api/echo/callback"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddUrl(input);
                  }
                }}
              />
              <Button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddUrl(input);
                }}
                disabled={Boolean(z.url().safeParse(input).error)}
                size="sm"
                variant="primaryGhost"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-fit px-2 py-1"
              >
                Add
                <CornerDownLeft className="size-2.5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {field.value.map((url: string) => (
                <Badge
                  key={url}
                  variant="muted"
                  className="flex gap-1 items-center"
                >
                  {url}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0.5 size-fit"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveUrl(url);
                    }}
                  >
                    <X className="size-2.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
};
