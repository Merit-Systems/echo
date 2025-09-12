import { AlertCircle } from 'lucide-react';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';

import type { ErrorComponentProps } from './types';
import Link from 'next/link';

export const ErrorCard: React.FC<ErrorComponentProps> = ({
  title = 'An Error Has Occurred!',
  description = "We've reported this to our team and will investigate it shortly.",
  errorProps,
  Icon = AlertCircle,
  actions,
}) => {
  return (
    <Card className="gap-4 flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <Icon className="size-12 text-primary mb-4" />
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {actions ? (
          actions
        ) : errorProps ? (
          <Button onClick={errorProps.reset} className="w-full">
            Reset
          </Button>
        ) : (
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export const NotFoundCard: React.FC<ErrorComponentProps> = ({
  title = 'Not Found',
  description = 'The page you are looking for does not exist.',
  ...rest
}) => {
  return <ErrorCard title={title} description={description} {...rest} />;
};

export const ForbiddenCard: React.FC<ErrorComponentProps> = ({
  title = 'Forbidden',
  description = 'You are not authorized to access this resource.',
  ...rest
}) => {
  return <ErrorCard title={title} description={description} {...rest} />;
};
