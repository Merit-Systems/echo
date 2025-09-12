import { AnthropicModels } from '../../../../../sdk/ts/src/supported-models/chat/anthropic';
import { GeminiModels } from '../../../../../sdk/ts/src/supported-models/chat/gemini';
import { OpenAIModels } from '../../../../../sdk/ts/src/supported-models/chat/openai';
import { SupportedModel } from '../../../../../sdk/ts/src/supported-models/types';

interface ModelTableProps {
  path: string;
}

export function ModelTable({ path }: ModelTableProps) {
  // Dynamic import functionality would need to be handled at build time
  // For now, we'll map the known paths to their respective imports
  const getModels = (): SupportedModel[] => {
    if (path.includes('anthropic')) {
      return AnthropicModels;
    }
    if (path.includes('openai')) {
      return OpenAIModels;
    }
    if (path.includes('gemini')) {
      return GeminiModels;
    }
    return [];
  };

  const models = getModels();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-medium">Model</th>
            <th className="text-left p-2 font-medium">Input Cost</th>
            <th className="text-left p-2 font-medium">Output Cost</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <tr
              key={model.model_id}
              className={`border-b border-border/50 ${
                index % 2 === 0 ? 'bg-muted/20' : ''
              }`}
            >
              <td className="p-2 font-mono text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  {model.model_id}
                </code>
              </td>
              <td className="p-2 text-sm">
                ${(model.input_cost_per_token * 1000000).toFixed(2)} / 1M tokens
              </td>
              <td className="p-2 text-sm">
                ${(model.output_cost_per_token * 1000000).toFixed(2)} / 1M
                tokens
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
