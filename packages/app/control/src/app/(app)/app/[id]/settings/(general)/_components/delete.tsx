'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/trpc/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

interface Props {
  appId: string;
  appName: string;
}

const deleteMyProjectText = 'delete my project';

export const DeleteAppCard: React.FC<Props> = ({ appId, appName }) => {
  const router = useRouter();

  const [nameInput, setNameInput] = useState('');
  const [deleteMyProjectInput, setDeleteMyProjectInput] = useState('');

  const {
    mutate: deleteApp,
    isPending,
    isSuccess,
  } = api.apps.app.delete.useMutation({
    onSuccess: () => {
      toast.success('App deleted');
      router.replace('/dashboard');
    },
    onError: () => {
      toast.error('Failed to delete app');
    },
  });

  const handleDelete = () => {
    if (nameInput !== appName) {
      toast.error('Name does not match');
      return;
    }
    if (deleteMyProjectInput !== deleteMyProjectText) {
      toast.error('Delete my project does not match');
      return;
    }
    deleteApp({ appId });
  };

  return (
    <Card className="overflow-hidden border-destructive/30">
      <CardHeader>
        <CardTitle className="text-xl">Delete App</CardTitle>
        <CardDescription>Delete your app. We will keep your</CardDescription>
      </CardHeader>
      <CardFooter className="border-t border-destructive/30 bg-destructive/10 py-3 px-4 flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete App</Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0">
            <DialogHeader className="border-b p-4">
              <DialogTitle>Delete App</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your app?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-4 bg-muted border-b">
              <div className="flex flex-col gap-2">
                <Label className="gap-0">
                  To confirm, type &quot;<strong>{appName}</strong>&quot;
                </Label>
                <Input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="bg-card focus-visible:ring-destructive/50 focus-visible:border-destructive/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="gap-0">
                  To confirm, type &quot;<strong>{deleteMyProjectText}</strong>
                  &quot;
                </Label>
                <Input
                  value={deleteMyProjectInput}
                  onChange={e => setDeleteMyProjectInput(e.target.value)}
                  className="bg-card focus-visible:ring-destructive/50 focus-visible:border-destructive/50"
                />
              </div>
            </div>
            <div className="p-4 border-b">
              <Alert variant="warning">
                <AlertCircle />
                <AlertTitle>This will archive your app for 30 days</AlertTitle>
              </Alert>
            </div>
            <DialogFooter className="p-4 bg-muted">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  isPending ||
                  nameInput !== appName ||
                  deleteMyProjectInput !== deleteMyProjectText
                }
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="size-4" />
                ) : (
                  'Delete App'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
