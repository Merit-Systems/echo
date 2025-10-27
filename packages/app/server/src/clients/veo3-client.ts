import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import { Result, ResultAsync, fromPromise, err, ok } from 'neverthrow';

dotenv.config();

async function makeRequest(): Promise<Result<void, Error>> {
  const ai = new GoogleGenAI({
    apiKey: process.env.ECHO_API_KEY || '',
    // apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      baseUrl: 'http://localhost:3070',
    },
  });

  const prompt = `An anime-style racing scene. A cool looking guy is racing away from villians in a japanese sports car.`;

  // Generate videos operation
  const generateVideosResult = await fromPromise(
    ai.models.generateVideos({
      model: 'veo-3.0-fast-generate-001',
      prompt: prompt,
      config: {
        durationSeconds: 4,
      },
    }),
    error => new Error(`Failed to generate videos: ${error}`)
  );

  if (generateVideosResult.isErr()) {
    return err(generateVideosResult.error);
  }

  let operation = generateVideosResult.value;

  // Poll the operation status until the video is ready.
  while (!operation.done) {
    console.log('Waiting for video generation to complete...');

    const getOperationResult = await fromPromise(
      ai.operations.getVideosOperation({
        operation: operation,
      }),
      error => new Error(`Failed to get operation status: ${error}`)
    );

    if (getOperationResult.isErr()) {
      return err(getOperationResult.error);
    }

    operation = getOperationResult.value;

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const video = operation.response?.generatedVideos?.[0]?.video;
  console.log('video: ', video);
  if (!video) {
    return err(new Error('No video generated'));
  }

  const uri = video.uri?.split('/').pop();
  console.log('video.uri: ', video.uri);
  console.log('uri: ', uri);

  // Download the generated video.
  const downloadResult = await fromPromise(
    ai.files.download({
      file: video,
      downloadPath: 'video_outputs/dialogue_example.mp4',
    }),
    error => new Error(`Failed to download video: ${error}`)
  );

  if (downloadResult.isErr()) {
    return err(downloadResult.error);
  }

  console.log(`Generated video saved to video_outputs/dialogue_example.mp4`);
  return ok(undefined);
}

makeRequest().then(result => {
  if (result.isErr()) {
    console.error('Error:', result.error.message);
    return;
  }

  console.log('\n');
  console.log('done');
});
