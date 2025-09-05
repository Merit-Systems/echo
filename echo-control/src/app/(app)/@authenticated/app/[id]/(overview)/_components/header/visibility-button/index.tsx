import { Suspense } from 'react';

import { VisibilityButton as Button } from './button';

interface Props {
  appId: string;
}

export const VisibilityButton: React.FC<Props> = ({ appId }) => {
  return (
    <Suspense>
      <Button appId={appId} />
    </Suspense>
  );
};
