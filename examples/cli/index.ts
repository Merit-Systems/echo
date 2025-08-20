import { EchoClient } from '../../echo-typescript-sdk/src/index.js';
import { DiskProvider } from './api-token-provider.js';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const APP_ID = 'ee4098b8-1b0a-415d-8246-c0be040aa08f';

async function main() {
  // Initialize the Echo client with disk-based API key provider
  const diskProvider = new DiskProvider(APP_ID);
  await diskProvider.prompt();
  const client = new EchoClient({ tokenProvider: diskProvider });

  console.log('Echo CLI Example');
  console.log('================');

  const apiKey = (await diskProvider.getAccessToken())!;
  const openAI = createOpenAI({
    apiKey,
    baseURL: 'https://echo.router.merit.systems/',
  });

  const { text } = await generateText({
    model: openAI('gpt-5'),
    prompt: 'What is the capital of France?',
  });

  // TODO(sragss): Two big questions
  // 1. Are we going to have multiple copies of the Vercel AI SDK wrappers?
  // 2. Am I going to create a CLI SDK just for saving keys?

  console.log(text);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
