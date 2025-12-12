import { BaseProvider } from './BaseProvider';
import { env } from '../env';

export abstract class OpenAIBaseProvider extends BaseProvider {
  getApiKey(): string | undefined {
    return env.OPENAI_API_KEY;
  }
}
