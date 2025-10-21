import OpenAI from 'openai';
import dotenv from 'dotenv';
import { OpenRouterModels } from '@merit-systems/echo-typescript-sdk';

dotenv.config();

// Function to get a random model from the OpenRouter model prices
function getRandomModel(): string {
  const models = OpenRouterModels;
  const randomIndex = Math.floor(Math.random() * models.length);
  const selectedModel = models[randomIndex];
  if (selectedModel) {
    console.log(
      `Selected random model: ${selectedModel.model_id} (${selectedModel.provider})`
    );
    return selectedModel.model_id;
  }
  throw new Error('No models found');
}

async function makeRequest(useStreaming: boolean = false) {
  try {
    // Get a random model for this request
    const randomModel = getRandomModel();

    // Initialize OpenAI client with custom baseURL
    const openai = new OpenAI({
      baseURL: 'https://echo-staging.up.railway.app',
      apiKey: process.env.ECHO_API_KEY, // Required by the client but not used with local server
    });

    if (useStreaming) {
      // Make a completion request with streaming enabled
      const stream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'hello world' }],
        model: randomModel,
        stream: true,
      });

      // Process the stream
      console.log('Streaming response:');
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content); // Force flush
      }
      console.log('\n'); // Add a newline at the end
    } else {
      // Make a regular completion request
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'hello world' }],
        model: randomModel,
      });
      if (completion.choices[0]?.message?.content) {
        console.log('completion text:', completion.choices[0].message.content);
      } else {
        console.log('completion text: no content');
      }
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
}

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});
makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});

makeRequest(true).then(() => {
  console.log('\n');
  console.log('done');
});
