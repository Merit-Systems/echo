import { useState, useRef } from 'react';
import { useEcho } from '@merit-systems/echo-react-sdk';

export function AudioTranscription() {
  const { user } = useEcho();
  const [transcription, setTranscription] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [model, setModel] = useState<'whisper-1' | 'whisper-large-v3'>('whisper-1');
  const [mode, setMode] = useState<'transcribe' | 'translate'>('transcribe');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setSelectedFile(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please ensure you have granted permission.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
      } else {
        alert('Please select an audio file');
        event.target.value = '';
      }
    }
  };

  // Process audio
  const processAudio = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setTranscription('');

    try {
      // Create form data for API call
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model', model);
      formData.append('response_format', 'json');

      const endpoint = mode === 'transcribe' ? '/audio/transcriptions' : '/audio/translations';
      
      // Make API call to Echo server (this would need to be implemented in the server routing)
      const response = await fetch(`/api/echo${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} audio`);
      }

      const result = await response.json();
      setTranscription(result.text);
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      alert(`Failed to ${mode} audio. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Clear everything
  const clearAll = () => {
    setTranscription('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Audio Transcription</h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Whisper Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'whisper-1' | 'whisper-large-v3')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="whisper-1">Whisper-1 (Fast)</option>
            <option value="whisper-large-v3">Whisper Large V3 (High Accuracy)</option>
          </select>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Processing Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'transcribe' | 'translate')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="transcribe">Transcribe (Same Language)</option>
            <option value="translate">Translate to English</option>
          </select>
        </div>
      </div>

      {/* Audio Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Audio Input</h3>
        
        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-white'}`} />
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="animate-pulse">●</div>
              <span className="text-sm">Recording...</span>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Or upload an audio file
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected file:</span> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="flex space-x-4">
        <button
          onClick={processAudio}
          disabled={!selectedFile || loading || !user}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Processing...</span>
            </div>
          ) : (
            `${mode === 'transcribe' ? 'Transcribe' : 'Translate'} Audio`
          )}
        </button>

        {(selectedFile || transcription) && (
          <button
            onClick={clearAll}
            disabled={loading}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {transcription && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'transcribe' ? 'Transcription' : 'Translation'} Result
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(transcription)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-sm text-gray-500 space-y-2">
        <p>• Supported formats: MP3, WAV, M4A, OGG, and other common audio formats</p>
        <p>• Maximum file size: 25 MB</p>
        <p>• Cost: $0.006 per minute of audio</p>
      </div>
    </div>
  );
}