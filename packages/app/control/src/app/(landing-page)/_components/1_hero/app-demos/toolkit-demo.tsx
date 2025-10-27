'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Mail, Loader2, Check } from 'lucide-react';
import { useTypewriter } from '@/hooks/use-typewriter';
import type { CardBodyProps } from './demo-card';

interface ToolCallState {
  text: string;
  displayText: string;
  isTyping: boolean;
  isLoading: boolean;
  isComplete: boolean;
}

export const ToolkitBody: React.FC<CardBodyProps> = ({ isActive }) => {
  const userPrompt = 'Cancel my meetings';
  const { displayText: userText, isComplete: userTextComplete } = useTypewriter(
    userPrompt,
    isActive,
    30
  );
  const [showTools, setShowTools] = useState(false);

  const [tool1, setTool1] = useState<ToolCallState>({
    text: 'Query Google Calendar',
    displayText: '',
    isTyping: false,
    isLoading: false,
    isComplete: false,
  });

  const [tool2, setTool2] = useState<ToolCallState>({
    text: 'Sending email to bill@merit.systems',
    displayText: '',
    isTyping: false,
    isLoading: false,
    isComplete: false,
  });

  useEffect(() => {
    if (!isActive) {
      setShowTools(false);
      setTool1({
        text: 'Query Google Calendar',
        displayText: '',
        isTyping: false,
        isLoading: false,
        isComplete: false,
      });
      setTool2({
        text: 'Sending email to bill@merit.systems',
        displayText: '',
        isTyping: false,
        isLoading: false,
        isComplete: false,
      });
      return;
    }

    if (userTextComplete) {
      setShowTools(true);
      // Start tool 1 after delay
      setTimeout(() => {
        animateTool(1);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTextComplete, isActive]);

  const animateTool = (toolNum: number) => {
    const tools = [tool1, tool2];
    const setTools = [setTool1, setTool2];
    const tool = tools[toolNum - 1];
    const setTool = setTools[toolNum - 1];

    // Start typing
    setTool({ ...tool, isTyping: true });

    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx <= tool.text.length) {
        setTool(prev => ({ ...prev, displayText: tool.text.slice(0, idx) }));
        idx++;
      } else {
        clearInterval(typeInterval);
        // Start loading
        setTool(prev => ({ ...prev, isTyping: false, isLoading: true }));

        setTimeout(() => {
          // Complete
          setTool(prev => ({ ...prev, isLoading: false, isComplete: true }));

          // Start next tool
          if (toolNum < 2) {
            setTimeout(() => animateTool(toolNum + 1), 200);
          }
        }, 400);
      }
    }, 10);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* User message */}
      <div className="ml-auto max-w-[80%]">
        <div className="text-xs bg-primary text-primary-foreground rounded-lg px-2 py-1.5">
          {userText}
          {!userTextComplete && userText && (
            <span className="animate-pulse">|</span>
          )}
        </div>
      </div>

      {/* Tool calls */}
      {showTools && (
        <div className="flex flex-col gap-1.5">
          {(tool1.isTyping || tool1.isLoading || tool1.isComplete) && (
            <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 border border-border">
              <Calendar className="size-3 flex-shrink-0" />
              <span className="flex-1">{tool1.displayText}</span>
              {tool1.isLoading && <Loader2 className="size-3 animate-spin" />}
              {tool1.isComplete && <Check className="size-3 text-green-600" />}
            </div>
          )}

          {(tool2.isTyping || tool2.isLoading || tool2.isComplete) && (
            <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 border border-border">
              <Mail className="size-3 flex-shrink-0" />
              <span className="flex-1">{tool2.displayText}</span>
              {tool2.isLoading && <Loader2 className="size-3 animate-spin" />}
              {tool2.isComplete && <Check className="size-3 text-green-600" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
