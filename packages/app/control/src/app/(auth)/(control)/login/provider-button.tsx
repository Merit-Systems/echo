import { Button } from '@/components/ui/button';
import { OAuthProvider } from '@/auth/types';

import { SiGoogle, SiGithub } from '@icons-pack/react-simple-icons';

export const ProviderButton = ({ provider }: { provider: OAuthProvider }) => {
  return (
    <Button
      type="submit"
      name="provider"
      value={provider.id}
      className="border-2 border-border rounded-xl size-fit md:size-fit px-5 py-3 font-bold flex-1 w-full"
      variant="secondary"
    >
      <ProviderIcon provider={provider} />
      Login with {provider.name}
    </Button>
  );
};

const ProviderIcon = ({ provider }: { provider: OAuthProvider }) => {
  const getIcon = () => {
    switch (provider.id) {
      case 'google':
        return SiGoogle;
      case 'github':
        return SiGithub;
      default:
        return null;
    }
  };

  const Icon = getIcon();

  if (!Icon) {
    return null;
  }

  return <Icon className="size-4" />;
};
