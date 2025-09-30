import { usePromptInputAttachments } from '@/components/ai-elements/prompt-input';
import { useEffect } from 'react';

declare global {
  interface Window {
    __promptInputActions?: {
      addFiles: (files: File[] | FileList) => void;
      clear: () => void;
    };
  }
}

/**
 * Component to bridge PromptInput context with external file operations
 * Exposes attachment methods via window global for programmatic access
 */
export function FileInputManager() {
  const attachments = usePromptInputAttachments();

  useEffect(() => {
    window.__promptInputActions = {
      addFiles: attachments.add,
      clear: attachments.clear,
    };

    return () => {
      delete window.__promptInputActions;
    };
  }, [attachments]);

  return null;
}
