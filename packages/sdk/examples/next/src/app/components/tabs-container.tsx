'use client';

import { useState } from 'react';
import Chat from './chat';
import ImageGenerator from './image';

export default function TabsContainer() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'image'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          🎨 Image Generation
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-lg shadow-sm border p-6">
        {activeTab === 'chat' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              AI Chat
            </h2>
            <Chat />
          </div>
        )}
        {activeTab === 'image' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              AI Image Generation
            </h2>
            <ImageGenerator />
          </div>
        )}
      </div>
    </div>
  );
}
