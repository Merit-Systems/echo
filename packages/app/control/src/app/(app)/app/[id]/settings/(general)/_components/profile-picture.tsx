'use client';

import Image from 'next/image';

import { useFormContext } from 'react-hook-form';

import { toast } from 'sonner';

import { Dropzone } from '@/components/ui/dropzone';

import { AppField } from './field';

import { api } from '@/trpc/client';
import { UploadIcon } from 'lucide-react';

export const AppProfilePicture = () => {
  const form = useFormContext();

  const { mutate: uploadImage, isPending: isUploading } =
    api.upload.image.useMutation({
      onSuccess: ({ url }) => {
        form.setValue('profilePictureUrl', url, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      },
    });

  return (
    <AppField name="profilePictureUrl">
      {field => (
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
          disabled={isUploading}
          className="size-24 md:size-24 p-0 flex flex-col items-center justify-center gap-1 overflow-hidden"
        >
          {field.value ? (
            <Image
              src={field.value as string}
              alt="Profile Picture"
              width={96}
              height={96}
              className="size-full hover:opacity-80 transition-opacity"
              unoptimized
            />
          ) : (
            <UploadIcon className="size-4" />
          )}
        </Dropzone>
      )}
    </AppField>
  );
};
