import OpenAI from 'openai';
import type {
  ResponseCreateParams,
  ResponseInputItem,
} from 'openai/resources/responses/responses';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('Echo API Test', () => {
  let oai: OpenAI;

  beforeAll(() => {
    // Check if ECHO_API_KEY is set
    if (!process.env.ECHO_API_KEY) {
      throw new Error('ECHO_API_KEY environment variable is not set');
    }

    console.log('ECHO_API_KEY:', process.env.ECHO_API_KEY);

    // Create OpenAI client with echo.router.merit.systems baseURL
    oai = new OpenAI({
      apiKey: process.env.ECHO_API_KEY,
      baseURL: 'http://localhost:3070',
      timeout: 30000,
    });
  });

  test('should successfully call OpenAI responses API through echo.router.merit.systems', async () => {
    const instructions =
      'You are a helpful assistant. Please respond with a simple greeting.';

    const input: ResponseInputItem[] = [
      {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: 'Hello! Can you say hi back?' }],
      },
    ];

    console.log('=== Echo API Test Debug ===');
    console.log('Base URL:', oai.baseURL);
    console.log(
      'API Key (first 10 chars):',
      process.env.ECHO_API_KEY?.substring(0, 10) + '...'
    );
    console.log('Input being sent:', JSON.stringify(input, null, 2));
    console.log('==========================');

    try {
      const response = await oai.responses.create({
        model: 'gpt-4o',
        instructions,
        input,
        stream: false, // Use non-streaming for simpler test
        store: true,
      } satisfies ResponseCreateParams);

      console.log('=== Response Debug ===');
      console.log('Response ID:', response.id);
      console.log('Response status:', response.status);
      console.log('Response output:', JSON.stringify(response.output, null, 2));
      console.log('=====================');

      // Basic assertions
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.status).toBe('completed');
      expect(response.output).toBeDefined();
      expect(Array.isArray(response.output)).toBe(true);

      // Check if there's a message in the output
      const messageOutput = response.output.find(
        item => item.type === 'message'
      );
      expect(messageOutput).toBeDefined();

      if (messageOutput && 'content' in messageOutput) {
        const textContent =
          messageOutput.content
            ?.filter((c: any) => c.type === 'output_text')
            ?.map((c: any) => c.text)
            ?.join('') || '';

        console.log('Extracted text content:', textContent);
        expect(textContent.length).toBeGreaterThan(0);
      }
    } catch (error) {
      console.error('Echo API test failed:', error);
      throw error;
    }
  }, 30000); // 30 second timeout

  test('should handle streaming responses', async () => {
    const instructions = 'You are a helpful assistant. Count from 1 to 3.';

    const input: ResponseInputItem[] = [
      {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: 'Please count from 1 to 3.' }],
      },
    ];

    try {
      const stream = await oai.responses.create({
        model: 'gpt-4o',
        instructions,
        input,
        stream: true,
      } satisfies ResponseCreateParams);

      let responseId: string | undefined;
      let textContent = '';

      for await (const event of stream) {
        console.log('Stream event type:', event.type);

        if (event.type === 'response.completed') {
          responseId = event.response.id;
          console.log('Response completed with ID:', responseId);

          // Extract text content from completed response
          for (const item of event.response.output) {
            if (item.type === 'message' && 'content' in item) {
              textContent =
                item.content
                  ?.filter((c: any) => c.type === 'output_text')
                  ?.map((c: any) => c.text)
                  ?.join('') || '';
            }
          }
        } else if (event.type === 'response.output_text.delta') {
          console.log('Text delta:', (event as any).delta);
        }
      }

      expect(responseId).toBeDefined();
      expect(textContent.length).toBeGreaterThan(0);
      console.log('Final text content:', textContent);
    } catch (error) {
      console.error('Echo API streaming test failed:', error);
      throw error;
    }
  }, 30000); // 30 second timeout
});
