import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function makeRequest() {
  const ai = new GoogleGenAI({
    apiKey: process.env.ECHO_API_KEY || '',
    // apiKey: process.env.GEMINI_API_KEY || '',
    vertexai: true,
    httpOptions: {
      baseUrl: 'http://localhost:3070',
    },
  });

  const prompt = `An anime-style racing scene. A cool looking guy is racing away from villians in a japanese sports car.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.0-fast-generate-001',
    prompt: prompt,
    config: {
      durationSeconds: 4,
    },
  });
  // const newOperation = new GenerateVideosOperation();
  // newOperation.name =
  //   'models/veo-3.0-fast-generate-001/operations/nmzxcyndn7ee';
  // Poll the operation status until the video is ready.
  while (!operation.done) {
    console.log('Waiting for video generation to complete...');
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const video = operation.response?.generatedVideos?.[0]?.video;
  console.log('video: ', video);
  if (!video) {
    throw new Error('No video generated');
  }
  const uri = video.uri?.split('/').pop();
  console.log('video.uri: ', video.uri);
  console.log('uri: ', uri);
  // Download the generated video.
  ai.files.download({
    file: video,
    downloadPath: 'video_outputs/dialogue_example.mp4',
  });
  console.log(`Generated video saved to video_outputs/dialogue_example.mp4`);
}

makeRequest().then(() => {
  console.log('\n');
  console.log('done');
});
