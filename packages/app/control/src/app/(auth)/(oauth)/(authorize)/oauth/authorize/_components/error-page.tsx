import { AlertCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface Props {
  message: React.ReactNode;
  actions: React.ReactNode;
}

export const ErrorPage: React.FC<Props> = ({ message, actions }) => {
  return (
    <Card className="w-full flex flex-col justify-center">
      <CardHeader className="flex-row items-center gap-2">
        <AlertCircle className="size-6 text-red-500 mb-0" />
        <h1 className="text-xl font-bold text-foreground">
          An Error has Occurred
        </h1>
      </CardHeader>
      <CardContent>{message}</CardContent>
      <CardFooter className="flex gap-2">{actions}</CardFooter>
    </Card>
  );
};
