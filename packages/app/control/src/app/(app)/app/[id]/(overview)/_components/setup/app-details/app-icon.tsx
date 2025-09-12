'use client';

import Image from 'next/image';

import { Check, Loader2, UploadIcon } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner';

import { Dropzone } from '@/components/ui/dropzone';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { api } from '@/trpc/client';

import { updateAppSchema } from '@/services/apps/update';

const profilePictureSchema = z.object({
  profilePictureUrl: z.url(),
});

interface Props {
  appId: string;
  profilePictureUrl: string | null;
}

export const AppIcon: React.FC<Props> = ({ appId, profilePictureUrl }) => {
  const isCompleted = profilePictureUrl !== null;

  const form = useForm<z.infer<typeof profilePictureSchema>>({
    resolver: zodResolver(profilePictureSchema),
    defaultValues: {
      profilePictureUrl: profilePictureUrl ?? undefined,
    },
    mode: 'onChange',
  });

  const utils = api.useUtils();

  const {
    mutate: updateAppDetails,
    isPending: isUpdating,
    isSuccess,
  } = api.apps.app.update.useMutation({
    onSuccess: () => {
      toast.success('App details updated');
      utils.apps.app.get.invalidate({ appId });
    },
  });
  const { mutate: uploadImage, isPending: isUploading } =
    api.upload.image.useMutation({
      onSuccess: ({ url }) =>
        form.setValue('profilePictureUrl', url, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        }),
    });

  const handleSubmit = (data: z.infer<typeof updateAppSchema>) => {
    updateAppDetails({
      appId,
      ...data,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 h-full"
      >
        <FormField
          control={form.control}
          name="profilePictureUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <Dropzone
                  accept={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                  }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  onDrop={async files => {
                    if (files.length === 0) {
                      toast.error('No file selected');
                      return;
                    }
                    uploadImage(files[0]);
                  }}
                  disabled={isUploading || isCompleted}
                  className="h-20 md:h-20 w-full flex flex-col items-center justify-center gap-1"
                >
                  {field.value ? (
                    <Image
                      src={field.value}
                      alt="Profile Picture"
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                  ) : (
                    <UploadIcon className="size-4" />
                  )}
                  {isCompleted ? (
                    <span className="text-sm text-muted-foreground">
                      Icon Added Successfully
                    </span>
                  ) : field.value ? (
                    <span className="text-sm text-muted-foreground">
                      Upload Successful
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Upload an icon
                    </span>
                  )}
                </Dropzone>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full mt-auto"
          disabled={
            isUpdating ||
            isUploading ||
            !form.formState.isValid ||
            isSuccess ||
            isCompleted
          }
        >
          {isUpdating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="size-4" />
          ) : isCompleted ? (
            <Check className="size-4" />
          ) : (
            'Save'
          )}
        </Button>
      </form>
    </Form>
  );
};
