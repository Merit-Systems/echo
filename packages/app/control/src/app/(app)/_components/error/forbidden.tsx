import { ForbiddenScreen } from '@/components/error/screen';

import { ErrorPageContainer } from './container';

import { ErrorComponentProps } from '@/components/error/types';

export const AppGroupForbidden: React.FC<ErrorComponentProps> = props => {
  return (
    <ErrorPageContainer>
      <ForbiddenScreen {...props} />
    </ErrorPageContainer>
  );
};
