import { NotFoundScreen } from '@/components/error/screen';

import { ErrorPageContainer } from './container';

import { ErrorComponentProps } from '@/components/error/types';

export const AppGroupNotFound: React.FC<ErrorComponentProps> = props => {
  return (
    <ErrorPageContainer>
      <NotFoundScreen {...props} />
    </ErrorPageContainer>
  );
};
