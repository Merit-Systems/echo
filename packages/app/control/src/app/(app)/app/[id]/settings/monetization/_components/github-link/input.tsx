'use client';

import {
  FormControl,
  FormDescription,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const tabsTriggerClassName = cn(
  'shadow-none rounded-sm text-sm leading-none transition-colors bg-muted/80 border border-border',
  'data-[state=active]:bg-primary/10 data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary',
  'h-fit px-4 py-2',
  'cursor-pointer hover:bg-primary/5 hover:border-primary/50'
);

export const GithubLinkInput = () => {
  const form = useFormContext();

  const defaultValues = form.formState.defaultValues;

  return (
    <Tabs
      value={form.watch('type') ?? 'repo'}
      onValueChange={value => {
        form.setValue('type', value as 'user' | 'repo');

        if (value === defaultValues?.type && defaultValues?.url) {
          form.setValue('url', defaultValues.url);
        } else {
          form.setValue('url', '');
        }
      }}
      className="flex flex-col gap-4"
    >
      <FormField
        control={form.control}
        name="type"
        render={() => (
          <FormItem className="">
            <FormControl>
              <TabsList className="flex items-center gap-2 w-fit p-0 bg-transparent h-fit">
                <TabsTrigger
                  value="repo"
                  onClick={() => {
                    form.setValue('type', 'repo');
                  }}
                  className={tabsTriggerClassName}
                >
                  Pay to Repo
                </TabsTrigger>
                <span className="text-xs text-muted-foreground leading-none">
                  or
                </span>
                <TabsTrigger
                  value="user"
                  onClick={() => {
                    form.setValue('type', 'user');
                  }}
                  className={tabsTriggerClassName}
                >
                  Pay to User
                </TabsTrigger>
              </TabsList>
            </FormControl>
          </FormItem>
        )}
      />

      <TabsContent value="user" className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormControl>
                <Input
                  placeholder="richardhendricks"
                  {...field}
                  value={field.value.replace('https://github.com/', '')}
                  onChange={e => {
                    field.onChange(`https://github.com/${e.target.value}`);
                  }}
                  className="w-full md:w-1/2"
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                All profits will be claimable by this account on Merit Systems.
              </FormDescription>
            </FormItem>
          )}
        />
      </TabsContent>
      <TabsContent value="repo" className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormControl>
                <Input
                  placeholder="facebook/react"
                  {...field}
                  value={field.value.replace('https://github.com/', '')}
                  onChange={e => {
                    field.onChange(`https://github.com/${e.target.value}`);
                  }}
                  onPaste={e => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    if (text.includes('github.com/')) {
                      field.onChange(text);
                    } else {
                      field.onChange(`https://github.com/${text}`);
                    }
                  }}
                  className="w-full md:w-1/2"
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                All profits will be sent to this repo&apos;s Merit Systems
                account.
              </FormDescription>
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>
  );
};

export const LoadingGithubLinkInput = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-28 h-8" />
        <span className="text-xs text-muted-foreground leading-none">or</span>
        <Skeleton className="w-28 h-8" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-full md:w-1/2 h-8" />
        <Skeleton className="w-64 h-4" />
      </div>
    </div>
  );
};
