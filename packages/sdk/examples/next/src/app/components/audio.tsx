'use client';

import { useState, useRef } from 'react';
import { useEchoOpenAI } from '@merit-systems/echo-react-sdk';

export default function AudioTranscription() {
  const { openai, isReady } = useEchoOpenAI();
  const [result, setResult] = useState<{ text: string; duration?: number; language?: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file || !openai || !isReady) return;

    try {
      setIsTranscribing(true);
      setResult(null);
      setError(null);
      
      const response = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3', // Use the latest model
        response_format: 'json',
        timestamp_granularities: ['word'], // Get word-level timestamps
      });
      
      setResult(response);
    } catch (err) {
      console.error('Transcription failed:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslate = async () => {
    if (!file || !openai || !isReady) return;

    try {
      setIsTranslating(true);
      setResult(null);
      setError(null);
      
      const response = await openai.audio.translations.create({
        file: file,
        model: 'whisper-large-v3',
        response_format: 'json',
      });
      
      setResult(response);
    } catch (err) {
      console.error('Translation failed:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Audio File (mp3, mp4, wav, webm)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="audio/*, .mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm"
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleTranscribe}
            disabled={!file || !isReady || isTranscribing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranscribing ? '🔊 Transcribing...' : '🔊 Transcribe Audio'}
          </button>
          
          <button
            onClick={handleTranslate}
            disabled={!file || !isReady || isTranslating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? '🌍 Translating...' : '🌍 Translate to English'}
          </button>
          
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/90"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Transcription Result:
          </h3>
          <div className="p-3 border rounded-lg bg-card/50">
            <p className="whitespace-pre-wrap">{result.text}</p>
          </div>
          
          {/* Display additional information if available */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {result.language && (
              <div>
                <span className="font-medium">Language:</span> {result.language}
              </div>
            )}
            
            {result.duration && (
              <div>
                <span className="font-medium">Duration:</span> {Math.round(result.duration)} seconds
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}