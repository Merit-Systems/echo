import { useEcho, useEchoModelProviders } from '@merit-systems/echo-react-sdk';
import { experimental_generateImage as generateImage } from 'ai';
import { useState } from 'react';

export function ImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { openai } = useEchoModelProviders();
  const { user, isLoading } = useEcho();

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await generateImage({
        model: openai.image('gpt-image-1'),
        prompt: prompt.trim(),
        size: '1024x1024',
        providerOptions: { openai: { quality: 'low' } },
      });

      if (result.image) {
        setImageUrl(`data:image/png;base64,${result.image.base64}`);
      } else {
        setError('No image was generated');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading Echo providers...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Please sign in to generate images.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Image Description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <button
          onClick={handleGenerateImage}
          disabled={!prompt.trim() || isGenerating}
          className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating Image...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">Error: {error}</div>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Generated image"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">Generating your image...</span>
        </div>
      )}
    </div>
  );
}
