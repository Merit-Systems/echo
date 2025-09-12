import { InstallStep } from '../../lib/install-step';
import { Code } from '../../lib/code';

const step1Code = `import { EchoSignIn, useEcho } from '@merit-systems/echo-react-sdk';
import Chat from './chat';

export const App = () => {
  const { isAuthenticated, user, balance, signOut } = useEcho();
  return (
    <>
      <header>
        {isAuthenticated && (
          <div>
            <p>Balance: {balance?.balance}</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        )}
      </header>
      <main>
        {isAuthenticated ? <Chat /> : <EchoSignIn />}
      </main>
    </>
  );
}
export default App;`;

export const ReactStep1 = () => {
  return (
    <InstallStep
      index={0}
      title="Check Authentication State"
      description="Use the Echo hooks to check if the user is authenticated"
      body={<Code value={step1Code} lang="tsx" />}
    />
  );
};

const step2Code = `import { useEchoModelProviders } from '@merit-systems/echo-react-sdk';
import { useState } from 'react';
import { generateText } from 'ai';

export default function Chat() { 
  const [result, setResult] = useState("");
  const { openai } = useEchoModelProviders();

  const handleGen = async () => {
      const { text } = await generateText({
          model: openai('gpt-5-nano'),
          prompt: 'Two sentences. What is the cleanest way to make $1M?'
      });
      setResult(text);
  };
  return (
      <div>
          <button onClick={handleGen}>Generate Wisdom</button>
          <p>{result}</p>
      </div>
  );
}`;

export const ReactStep2 = () => {
  return (
    <InstallStep
      index={1}
      title="Configure Provider"
      description="Set up the Echo provider with your app ID"
      body={<Code value={step2Code} lang="tsx" />}
    />
  );
};
