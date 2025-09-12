import { ForbiddenScreen } from '@/components/error/screen';

export default function Forbidden() {
  return (
    <ForbiddenScreen
      title="Not Authorized"
      description="You do not have permission to view this page for this app."
    />
  );
}
