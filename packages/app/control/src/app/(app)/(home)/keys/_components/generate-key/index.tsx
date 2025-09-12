import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { GenerateKeyWithSelect } from './form';

export const GenerateKey = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="turbo">Generate Key</Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Generate API Key</DialogTitle>
          <DialogDescription>
            API Keys are scoped to a specific app and can only be used to
            authenticate with that app.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-full overflow-hidden p-4 pt-0">
          <GenerateKeyWithSelect />
        </div>
      </DialogContent>
    </Dialog>
  );
};
