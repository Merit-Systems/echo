import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

async function makeRequest(useStreaming: boolean = true) {
  try {
    // Initialize OpenAI client with custom baseURL
    const claude = new Anthropic({
      baseURL: 'http://localhost:3070',
      apiKey: process.env.ECHO_API_KEY, // Required by the client but not used with local server
    });

    if (useStreaming) {
      // Make a completion request with streaming enabled
      const stream = claude.messages
        .stream({
          model: 'claude-sonnet-4-20250514',
          // model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: 'Hello world',
            },
          ],
        })
        .on('text', text => {
          console.log(text);
        });

      const message = await stream.finalMessage();
      console.log(message);
    } else {
      // Make a regular completion request
      const completion = await claude.messages.create({
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello world' }],
        model: 'claude-sonnet-4-20250514',
        // model: 'claude-3-5-sonnet-20240620',
      });
      if (completion.content) {
        console.log('completion text:', completion.content);
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

makeRequest(false).then(() => {
  console.log('\n');
  console.log('done');
});
