'use client';

import {
  EchoProvider,
  EchoSignIn,
  EchoTokenPurchase,
  useEcho,
  useEchoOpenAI,
} from '@merit-systems/echo-react-sdk';
import { useState } from 'react';

function ChatInterface() {
  const { isAuthenticated } = useEcho();
  const { openai } = useEchoOpenAI();
  const [response, setResponse] = useState('');
  const [input, setInput] = useState('');

  const getMessage = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: input }],
    });
    setResponse(response.choices[0].message.content || '');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '.5rem',
        height: '50vh',
      }}
    >
      {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={getMessage}>Send Message</button>
      <p>{response}</p>
    </div>
  );
}

export default function ChatProvider() {
  return (
    <EchoProvider
      config={{
        appId: '169194c8-9f6f-4609-94a1-573489806f08',
        apiUrl: 'https://echo.merit.systems',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chat`,
      }}
    >
      <ChatInterface />
    </EchoProvider>
  );
}
