import { Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from './AppDetailShared';
import { PublicEchoApp, ModelUsage } from '@/lib/echo-apps/types';

interface GlobalModelsCardProps {
  app: PublicEchoApp;
  title?: string;
}

export function GlobalModelsCard({
  app,
  title = 'AI Models Used',
}: GlobalModelsCardProps) {
  // Direct access to type-safe properties for Public Apps
  const modelUsage = app.stats.globalModelUsage;
  const totalTokens = app.stats.globalTotalTokens;

  // Get the top 3 models by token usage for public display
  const topModels = modelUsage
    .sort(
      (a: ModelUsage, b: ModelUsage) =>
        (b.totalTokens || 0) - (a.totalTokens || 0)
    )
    .slice(0, 3);

  const totalModelsCount = modelUsage.length;

  const getModelDisplayName = (model: string): string => {
    // Extract readable model names
    if (model.includes('gpt-4')) return 'GPT-4';
    if (model.includes('gpt-3.5')) return 'GPT-3.5';
    if (model.includes('claude')) return 'Claude';
    if (model.includes('gemini')) return 'Gemini';
    return model.split('-')[0].toUpperCase();
  };

  const getModelColor = (model: string): string => {
    if (model.includes('gpt'))
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (model.includes('claude'))
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (model.includes('gemini'))
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">
                {totalModelsCount}
              </span>
              <p className="text-xs text-muted-foreground">Models Active</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-foreground">
                {formatNumber(totalTokens)}
              </span>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
            </div>
          </div>

          {/* Top Models */}
          <div className="space-y-2">
            {topModels.length > 0 ? (
              topModels.map((model: ModelUsage) => (
                <div
                  key={model.model}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-1 ${getModelColor(model.model)}`}
                    >
                      {getModelDisplayName(model.model)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(model.totalTokens || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No model usage data available
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
