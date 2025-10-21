import { BrainCircuit, Key, User } from 'lucide-react';

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
    </li>
  );
};

const scopeData = {
  'llm:invoke': {
    name: 'Make AI requests',
    icon: BrainCircuit,
    level: 'info',
  },
  offline_access: {
    name: 'Connect your user profile',
    icon: User,
    level: 'info',
  },
  'api_key:create': {
    name: 'Create API keys',
    icon: Key,
    level: 'warn',
  },
};
