import { InstallStep } from '../../lib/install-step';
import { Code } from '../../lib/code';

const step1Code = `// api/chat/route.ts
import { openai } from "@/echo";
import { convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai("gpt-5"), 
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}`;

export const NextStep1 = () => {
  return (
    <InstallStep
      index={0}
      title="Create a Chat Route Handler"
      description="Use the utility from the constructor"
      body={<Code value={step1Code} lang="tsx" />}
    />
  );
};

const step2Code = `"use client";

import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();
  return (
    <div>
      {messages.map((message) => (
        <div>{JSON.stringify(message)}</div>
      ))}
      <input value={input} onChange={(e) => setInput(e.currentTarget.value)} />
      <button type="submit" onClick={() => sendMessage({ text: input })}>Send</button>
    </div>
  );
}`;

export const NextStep2 = () => {
  return (
    <InstallStep
      index={1}
      title="Configure Provider and Handlers"
      description="Set up the Echo provider with your app ID"
      body={<Code value={step2Code} lang="tsx" />}
    />
  );
};
