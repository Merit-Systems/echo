"use client";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";

type ReadmeSummarizerProps = {
  owner: string;
  repo: string;
};

export default function ReadmeSummarizer({
  owner,
  repo,
}: ReadmeSummarizerProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        owner,
        repo,
      },
    }),
    id: `${owner}/${repo}`, // Reset chat when repo changes
  });
  const [hasStarted, setHasStarted] = useState(false);

  // Reset when repo changes
  useEffect(() => {
    setHasStarted(false);
  }, [owner, repo]);

  const handleStartSummary = () => {
    if (!hasStarted) {
      sendMessage({
        text: "Please summarize this repository's README.",
      });
      setHasStarted(true);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-semibold">
          Repository Summary: {owner}/{repo}
        </h3>
        <div className="mt-2">
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View on GitHub →
          </a>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">README Summary:</h4>
        {!hasStarted ? (
          <Button onClick={handleStartSummary}>Summarize README</Button>
        ) : status === "submitted" || (hasStarted && messages.length === 0) ? (
          <div>Generating summary...</div>
        ) : (
          <div className="space-y-4">
            {messages
              .filter((message) => message.role === "assistant")
              .map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Streamdown key={`${message.id}-${index}`}>
                            {part.text}
                          </Streamdown>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${index}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              index === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
