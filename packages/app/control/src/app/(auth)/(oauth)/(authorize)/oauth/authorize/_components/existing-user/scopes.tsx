import { BrainCircuit, Info, Key, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  scopes: string[];
}

export const Scopes: React.FC<Props> = ({ scopes }) => {
  return (
    <ul className="space-y-1">
      {scopes.map(scope => (
        <Scope key={scope} scope={scope} />
      ))}
    </ul>
  );
};

const Scope = ({ scope }: { scope: string }) => {
  const data = scopeData[scope as keyof typeof scopeData];

  if (!data) {
    return null;
  }
  return (
    <li
      className={`flex items-center gap-2 text-sm ${data.level === 'warn' ? 'text-yellow-500' : ''}`}
    >
      <data.icon className="size-4" />
      {data.name}
      {data.description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-pointer">
              <Info className="size-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{data.description}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </li>
  );
};

const scopeData = {
  'llm:invoke': {
    name: 'Make AI requests',
    icon: BrainCircuit,
    level: 'info',
    description:
      'You are allowing this app to make AI requests on your behalf.',
  },
  offline_access: {
    name: 'Connect your user profile',
    icon: User,
    level: 'info',
    description:
      'You are allowing this app to connect your user profile to your account.',
  },
  'api_key:create': {
    name: 'Create API keys',
    icon: Key,
    level: 'warn',
    description:
      'You are allowing this app to create a long lived access token, which can be revoked at any time in your Echo dashboard.',
  },
};
