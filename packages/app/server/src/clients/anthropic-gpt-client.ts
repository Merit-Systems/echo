import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ResultAsync, fromPromise } from 'neverthrow';

dotenv.config();

function makeRequest(useStreaming: boolean = false): ResultAsync<void, Error> {
  return fromPromise(
    (async () => {
      // Initialize OpenAI client with custom baseURL
      const openai = new OpenAI({
        baseURL: 'http://localhost:3070',
        apiKey: process.env.ECHO_API_KEY, // Required by the client but not used with local server
      });

      if (useStreaming) {
        // Make a completion request with streaming enabled
        const stream = await openai.chat.completions.create({
          messages: [
            { role: 'user', content: 'Tell me a long story about a cat!' },
          ],
          model: 'claude-3-5-sonnet-20240620',
          // model: 'gpt-3.5-turbo',
          stream: true,
        });

        // Process the stream
        console.log('Streaming response:');
        for await (const chunk of stream) {
          if (chunk.choices) {
            console.log(chunk.choices[0]?.delta?.content || '');
          }
          // process.stdout.write(content); // Force flush
        }
        console.log('\n'); // Add a newline at the end
      } else {
        // Make a regular completion request
        const completion = await openai.chat.completions.create({
          messages: [
            { role: 'user', content: 'Tell me a long story about a cat!' },
          ],
          model: 'claude-3-5-sonnet-20240620',
          // model: 'gpt-3.5-turbo',
        });
        if (completion.choices[0]?.message?.content) {
          console.log(
            'completion text:',
            completion.choices[0].message.content
          );
        } else {
          console.log('completion text: no content');
        }
      }
    })(),
    error => {
      return error instanceof Error ? error : new Error(String(error));
    }
  );
}

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Streaming request failed:', error);
  }
);

makeRequest(false).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Non-streaming request failed:', error);
  }
);
