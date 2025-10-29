import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ResultAsync, fromPromise } from 'neverthrow';

dotenv.config();

function makeRequest(): ResultAsync<void, Error> {
  return fromPromise(
    (async () => {
      console.log(process.env.ECHO_API_KEY);
      const openai = new OpenAI({
        baseURL: 'http://localhost:3070',
        apiKey: process.env.ECHO_API_KEY,
      });

      let video = await openai.videos.create({
        model: 'sora-2',
        prompt: 'A video of a cat playing with a ball',
      });
      console.log('Video generation started: ', video);
      let progress = video.progress ?? 0;

      while (video.status === 'in_progress' || video.status === 'queued') {
        video = await openai.videos.retrieve(video.id);
        progress = video.progress ?? 0;

        // Display progress bar
        const barLength = 30;
        const filledLength = Math.floor((progress / 100) * barLength);
        // Simple ASCII progress visualization for terminal output
        const bar =
          '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
        const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

        process.stdout.write(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Clear the progress line and show completion
      process.stdout.write('\n');

      if (video.status === 'failed') {
        console.error('Video generation failed');
        return;
      }

      console.log('Video generation completed: ', video);
    })(),
    error => (error instanceof Error ? error : new Error(String(error)))
  );
}

makeRequest().match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Error making request:', error);
  }
);
