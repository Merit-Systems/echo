import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function makeRequest(useStreaming: boolean = false) {
  try {
    // Initialize OpenAI client with custom baseURL
    const openai = new OpenAI({
      // baseURL: 'http://localhost:3070',
      baseURL: 'https://echo.router.merit.systems',
      apiKey: process.env.ECHO_API_KEY, // Required by the client but not used with local server
    });

    if (useStreaming) {
      // Make a completion request with streaming enabled
      const stream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello world!' }],
        model: 'gemini-2.5-flash',
        // model: 'gemini-2.5-pro',
        // model: 'gemini-2.0-flash',
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
        messages: [{ role: 'user', content: 'Hello world!' }],
        model: 'gemini-2.5-flash',
        // model: 'gemini-2.5-pro',
        // model: 'gemini-2.0-flash',
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

makeRequest(false).then(() => {
  console.log('\n');
  console.log('done');
});
