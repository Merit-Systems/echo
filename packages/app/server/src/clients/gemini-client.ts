import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ResultAsync, fromPromise } from 'neverthrow';

dotenv.config();

function makeRequest(useStreaming: boolean = false): ResultAsync<void, Error> {
  return fromPromise(
    (async () => {
      // Initialize Gemini client
      const ai = new GoogleGenAI({
        apiKey: process.env.ECHO_API_KEY || '',
        // apiKey: process.env.GEMINI_API_KEY || '',
        httpOptions: {
          baseUrl: 'http://localhost:3070',
        },
      });

      if (useStreaming) {
        // Make a completion request with streaming enabled
        // Note: Streaming API needs to be investigated for this package
        const response = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          // model: 'gemini-2.0-flash',
          contents: 'Hello world',
        });

        for await (const chunk of response) {
          console.log('Response text:', chunk.text);
        }
      } else {
        // Make a regular completion request
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          // model: 'gemini-2.0-flash',
          contents: 'Hello world',
        });

        console.log('Completion text:', response.text);
      }
    })(),
    error => (error instanceof Error ? error : new Error(String(error)))
  );
}

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done with streaming');
  },
  error => {
    console.error('Error making streaming request:', error);
  }
);

makeRequest(false).match(
  () => {
    console.log('\n');
    console.log('done with non-streaming');
  },
  error => {
    console.error('Error making non-streaming request:', error);
  }
);
