'use client';

import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NewChatButton = () => {
  const router = useRouter();

  const handleNewChat = () => {
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleNewChat}
      className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <MessageSquare className="h-4 w-4" />
      <span>New Chat</span>
    </button>
  );
};

export default NewChatButton;
