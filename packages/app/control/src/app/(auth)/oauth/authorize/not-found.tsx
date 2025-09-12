import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { ErrorPage } from './_components/error-page';

export default function NotFound() {
  return (
    <ErrorPage
      message={
        <div className="flex flex-col gap-2 text-sm">
          <p>The app you are trying to authorize with does not exist.</p>
          <p>
            If you are the developer of this app, please make sure you are using
            the correct ID.
          </p>
        </div>
      }
      actions={
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      }
    />
  );
}
