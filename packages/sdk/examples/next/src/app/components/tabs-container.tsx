'use client';

import { useState } from 'react';

import Chat from './chat';
import ImageGenerator from './image';
import AudioTranscription from './audio';

export default function TabsContainer() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'audio'>('chat');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b mb-6 font-mono">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 font-medium tracking-wide text-sm border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-6 py-3 font-medium tracking-wide text-sm border-b-2 transition-colors ${
            activeTab === 'image'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Image Generation
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'audio'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          🎵 Audio Transcription
        </button>
      </div>

      {/* Tab Content (kept mounted to preserve state) */}
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className={activeTab === 'chat' ? '' : 'hidden'}>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            AI Chat
          </h2>
          <Chat />
        </div>
        <div className={activeTab === 'image' ? '' : 'hidden'}>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            AI Image Generation
          </h2>
          <ImageGenerator />
        </div>
        <div className={activeTab === 'audio' ? '' : 'hidden'}>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            AI Audio Transcription
          </h2>
          <AudioTranscription />
        </div>
      </div>
    </div>
  );
}
