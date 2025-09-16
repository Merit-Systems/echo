import {
  EchoChatProvider,
  EchoProvider,
  useEcho,
  useEchoModelProviders,
} from '@merit-systems/echo-react-sdk';
import { streamText, type ModelMessage } from 'ai';
import Chat from './chat';
import Header from './header';

function App() {
  return (
    <div className={`flex h-screen flex-col antialiased`}>
      <EchoProvider
        config={{
          appId: import.meta.env.VITE_ECHO_APP_ID,
        }}
      >
        <Header title="Echo Chat" />
        <div className="min-h-0 flex-1">
          <ChatWrapper />
        </div>
      </EchoProvider>
    </div>
  );
}

export function ChatWrapper() {
  const { openai } = useEchoModelProviders();
  const { user } = useEcho();

  async function doChat({ modelMessages }: { modelMessages: ModelMessage[] }) {
    const result = streamText({
      model: openai('gpt-5'),
      messages: modelMessages,
    });
    return result.toUIMessageStream(); // in-memory UI chunk stream
  }

  return (
    <EchoChatProvider chatFn={doChat} key={user?.id}>
      <Chat />
    </EchoChatProvider>
  );
}

export default App;
