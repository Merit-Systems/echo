import { useEcho, useEchoOpenAI } from '@merit-systems/echo-react-sdk';
import { useState, useRef } from 'react';

export function AudioTranscription() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ text: string; duration?: number } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openai, isReady } = useEchoOpenAI();
  const { user, isLoading } = useEcho();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file || isTranscribing || !user || !openai || !isReady) return;

    setIsTranscribing(true);
    setError(null);
    
    try {
      const response = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3', // Use the new model
        response_format: 'json',
        timestamp_granularities: ['word'], // Get word-level timestamps
      });

      setResult({
        text: response.text,
        duration: (response as any).duration, // Duration might be available depending on response_format
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        <div className="text-gray-600">
          Please sign in to use audio transcription
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Audio Transcription</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select an audio file (mp3, mp4, wav, webm)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="audio/*, .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm"
          className="block w-full text-sm text-gray-500 
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />
      </div>

      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleTranscribe}
          disabled={!file || isTranscribing}
          className={`px-4 py-2 rounded-md font-medium ${
            !file || isTranscribing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
        </button>
        
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Transcription Result</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="whitespace-pre-wrap">{result.text}</p>
          </div>
          
          {result.duration && (
            <p className="mt-2 text-sm text-gray-600">
              Audio duration: {Math.round(result.duration)} seconds
            </p>
          )}
        </div>
      )}
    </div>
  );
}