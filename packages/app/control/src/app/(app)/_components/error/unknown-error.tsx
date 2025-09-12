import { ErrorScreen } from '@/components/error/screen';

import { ErrorPageContainer } from './container';

import { ErrorComponentProps } from '@/components/error/types';

export const AppGroupError: React.FC<ErrorComponentProps> = props => {
  return (
    <ErrorPageContainer>
      <ErrorScreen {...props} />
    </ErrorPageContainer>
  );
};
