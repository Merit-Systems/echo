'use client';

import NextImage from 'next/image';
import { useState } from 'react';

export default function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState<{
    base64Data: string;
    mediaType: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const { imageUrl } = await response.json();
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={generateImage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image Prompt
          </label>
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            disabled={loading}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🎨 Generating...' : '🎨 Generate Image'}
        </button>
      </form>

      {/* Generated Image */}
      {imageUrl && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Generated Image:
          </h3>
          <div className="relative border rounded-lg overflow-hidden h-96">
            <NextImage
              src={`data:${imageUrl.mediaType};base64,${imageUrl.base64Data}`}
              alt={prompt || 'Generated image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground italic">
            &quot;{prompt}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
