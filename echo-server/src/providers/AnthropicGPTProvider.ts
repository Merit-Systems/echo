import type { CompletionStateBody, StreamingChunkBody } from './GPTProvider';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';

export const parseSSEAnthropicGPTFormat = (
  data: string
): StreamingChunkBody[] => {
  // Split by double newlines to separate events
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];

  for (const event of events) {
    if (!event.trim()) continue;

    // Each event should start with 'data: '
    if (!event.startsWith('data: ')) continue;

    const jsonStr = event.slice(6); // Remove 'data: ' prefix
    const trimmed = jsonStr.trim();

    // Skip [DONE] marker
    if (trimmed === '[DONE]') continue;

    // Skip ping events
    if (trimmed.includes('"type": "ping"')) continue;

    try {
      const parsed = JSON.parse(trimmed);
      // Only add valid chunks that have the expected structure
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'choices' in parsed
      ) {
        chunks.push(parsed);
      }
    } catch (error) {
      // Log error but continue processing other events
      console.warn('Error parsing SSE chunk:', error);
      continue;
    }
  }

  return chunks;
};

export class AnthropicGPTProvider extends GPTProvider {
  override getType(): ProviderType {
    return ProviderType.ANTHROPIC_GPT;
  }

  override getBaseUrl(): string {
    // Anthropic API supports OpenAI API format
    // You just have to add /v1 to the end of the URL
    return `${this.ANTHROPIC_BASE_URL}/v1`;
  }

  override getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  override async handleBody(data: string): Promise<void> {
    try {
      let prompt_tokens = 0;
      let completion_tokens = 0;
      let total_tokens = 0;
      let providerId = 'null';

      if (this.getIsStream()) {
        const chunks = parseSSEAnthropicGPTFormat(data);

        for (const chunk of chunks) {
          if (chunk.usage) {
            prompt_tokens += chunk.usage.prompt_tokens;
            completion_tokens += chunk.usage.completion_tokens;
            total_tokens += chunk.usage.total_tokens;
          }
          providerId = chunk.id;
        }
      } else {
        const parsed = JSON.parse(data) as CompletionStateBody;
        prompt_tokens += parsed.usage.prompt_tokens;
        completion_tokens += parsed.usage.completion_tokens;
        total_tokens += parsed.usage.total_tokens;
        providerId = parsed.id;
      }

      // Calculate cost using the base provider method
      const costResult = await this.getCostPerToken(
        prompt_tokens,
        completion_tokens
      );

      // Create transaction with proper model info and token details
      await this.getEchoControlService().createTransaction(
        {
          model: this.getModel(),
          inputTokens: prompt_tokens,
          outputTokens: completion_tokens,
          totalTokens: total_tokens,
          cost: costResult.cost,
          status: 'success',
          providerId: providerId,
        },
        costResult.usageProduct
      );
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }
}
