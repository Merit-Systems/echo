import { InstallStep } from '../../lib/install-step';
import { Code } from '../../lib/code';
import { CodeTabs } from '@/components/ui/shadcn-io/code-tabs';

export const ReactStep1 = () => {
  return (
    <InstallStep
      index={0}
      title="Install SDKs"
      description="Utilities for authentication and LLM generation"
      body={
        <CodeTabs
          codes={{
            npm: 'npm install @merit-systems/echo-react-sdk ai',
            yarn: 'yarn add @merit-systems/echo-react-sdk ai',
            bun: 'bun add @merit-systems/echo-react-sdk ai',
            pnpm: 'pnpm add @merit-systems/echo-react-sdk ai',
          }}
        />
      }
    />
  );
};

const step2Code = (appId: string) => `// main.tsx
import { EchoProvider } from '@merit-systems/echo-react-sdk';

createRoot(document.getElementById('root')!).render(
  <EchoProvider 
    config={{ appId: "${appId}" }}
  >
    <App />
  </EchoProvider>
)`;

export const ReactStep2 = ({ appId }: { appId: string }) => {
  return (
    <InstallStep
      index={1}
      title="Configure Provider"
      description="Set up the Echo provider with your app ID"
      body={<Code value={step2Code(appId)} lang="tsx" />}
    />
  );
};

const step3Code = `import { useEcho } from '@merit-systems/echo-react-sdk';

export const SignInButton = () => {
  const { signIn } = useEcho();
  return (
    <button onClick={signIn}>
      Sign In
    </button>
  );
}`;

export const ReactStep3 = () => {
  return (
    <InstallStep
      index={2}
      title="Authenticate your Users"
      description="Use our sign in utilities to authenticate your users"
      body={<Code value={step3Code} lang="tsx" />}
    />
  );
};
