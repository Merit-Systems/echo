import Link from 'next/link';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const NewAppButton = () => {
  return (
    <Link href="/new">
      <Button variant="turbo">
        <Plus className="size-4" />
        Create
      </Button>
    </Link>
  );
};
