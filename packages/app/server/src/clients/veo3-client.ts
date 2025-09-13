import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function makeRequest() {
  const ai = new GoogleGenAI({
    apiKey: process.env.ECHO_API_KEY || '',
    // apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      baseUrl: 'http://localhost:3070',
    },
  });

  const prompt = `A close up of two people staring at a cryptic drawing on a wall, torchlight flickering.
    A man murmurs, 'This must be it. That's the secret code.' The woman looks at him and whispering excitedly, 'What did you find?'`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.0-generate-001',
    prompt: prompt,
  });

  // Poll the operation status until the video is ready.
  while (!operation.done) {
    console.log('Waiting for video generation to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) {
    throw new Error('No video generated');
  }
  // Download the generated video.
  ai.files.download({
    file: '3nehbz3n08tz',
    downloadPath: 'dialogue_example.mp4',
  });
  console.log(`Generated video saved to dialogue_example.mp4`);
}

makeRequest().then(() => {
  console.log('\n');
  console.log('done');
});
