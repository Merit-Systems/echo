import { useState } from 'react';

import { Info } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/trpc/client';
import { CopyButton } from '@/components/ui/copy-button';

interface Props {
  generateApiKey: (name?: string) => Promise<string>;
  isPending: boolean;
  apiKey?: string;
  disabled?: boolean;
}

export const GenerateApiKey: React.FC<Props> = ({
  generateApiKey,
  isPending,
  apiKey,
  disabled,
}) => {
  const [name, setName] = useState<string>();

  const { copyToClipboard } = useCopyToClipboard(() => {
    toast.success('Copied to clipboard');
  });

  const utils = api.useUtils();

  if (apiKey) {
    return (
      <div className="flex flex-col gap-2 w-full overflow-hidden">
        <div className="">
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Your API Key
          </label>
          <div className="flex items-center w-full border border-primary shadow-md shadow-primary rounded-md overflow-hidden pl-2 pr-1 py-1 bg-muted">
            <p className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm no-scrollbar pr-2">
              {apiKey}
            </p>
            <CopyButton text={apiKey} toastMessage="Copied to clipboard" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You can add this API key to your CLI tool to use Echo from your
          terminal. Store this key somewhere secure since{' '}
          <strong>you won&apos;t be able to see it again</strong>. You can
          generate another key at any time.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="size-fit p-0 text-muted-foreground/60"
            >
              <Info className="size-3" />
              Security Information
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Security Information</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden" />
            <ul className="text-sm space-y-1">
              <li>• Keep this API key secure and never share it publicly</li>
              <li>• This key provides access to your Echo account</li>
              <li>• This key is scoped only to the selected Echo app</li>
              <li>• Store it safely in your CLI tool</li>
              <li>
                • You won&apos;t be able to see this key again after leaving
                this page
              </li>
            </ul>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="api-key-name"
          className="block text-sm font-medium text-card-foreground"
        >
          API Key Name
        </Label>
        <Input
          id="api-key-name"
          type="text"
          onChange={e => setName(e.target.value)}
          placeholder="Enter a name for this API key"
        />
      </div>

      <Button
        onClick={() =>
          generateApiKey(name)
            .then(key => copyToClipboard(key))
            .then(() => utils.user.apiKeys.list.invalidate())
            .catch(error => {
              toast.error('Failed to generate API key');
              console.error(error);
            })
        }
        disabled={isPending || disabled}
        variant="turbo"
      >
        {isPending ? 'Generating...' : 'Generate API Key'}
      </Button>
    </div>
  );
};
