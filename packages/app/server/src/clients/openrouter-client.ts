import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Result, ResultAsync, fromPromise, ok, err } from 'neverthrow';
import { OpenRouterModels } from '@merit-systems/echo-typescript-sdk';

dotenv.config();

// Function to get a random model from the OpenRouter model prices
function getRandomModel(): Result<string, Error> {
  const models = OpenRouterModels;
  const randomIndex = Math.floor(Math.random() * models.length);
  const selectedModel = models[randomIndex];
  if (selectedModel) {
    console.log(
      `Selected random model: ${selectedModel.model_id} (${selectedModel.provider})`
    );
    return ok(selectedModel.model_id);
  }
  return err(new Error('No models found'));
}

function makeRequest(useStreaming: boolean = false): ResultAsync<void, Error> {
  return fromPromise(
    (async () => {
      // Get a random model for this request
      const randomModelResult = getRandomModel();
      if (randomModelResult.isErr()) {
        throw randomModelResult.error;
      }
      const randomModel = randomModelResult.value;

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
          console.log(
            'completion text:',
            completion.choices[0].message.content
          );
        } else {
          console.log('completion text: no content');
        }
      }
    })(),
    (error: unknown) =>
      error instanceof Error ? error : new Error(String(error))
  );
}

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);

makeRequest(true).match(
  () => {
    console.log('\n');
    console.log('done');
  },
  error => {
    console.error('Request failed:', error);
  }
);
