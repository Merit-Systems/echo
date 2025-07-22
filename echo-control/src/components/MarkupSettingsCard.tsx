'use client';

import { CheckIcon, DollarSignIcon } from 'lucide-react';
import { GlassButton } from './glass-button';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';

interface MarkupSettingsCardProps {
  appId: string;
  appName: string;
}

export default function MarkupSettingsCard({ appId }: MarkupSettingsCardProps) {
  const {
    markupPercentage,
    inputValue,
    loading,
    saving,
    success,
    error,
    handleSave,
    handleInputChange,
    setInputValue,
    isChanged,
  } = useMarkupSettings(appId);

  const currentPercentage = parseFloat(inputValue) || 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSignIcon className="h-5 w-5 text-secondary" />
          <div>
            <h3 className="font-semibold text-foreground">Markup Settings</h3>
            <p className="text-sm text-muted-foreground">
              This is the premium applied to the token costs you will receive.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {markupPercentage}%
          </div>
          <div className="text-xs text-muted-foreground">Current</div>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              max="1000"
              step="1"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg text-lg font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
              %
            </span>
          </div>
          <GlassButton
            onClick={handleSave}
            disabled={saving || !isChanged}
            variant={
              success ? 'secondary' : isChanged ? 'primary' : 'secondary'
            }
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                Saving
              </div>
            ) : success ? (
              <div className="flex items-center ">
                <CheckIcon className="h-4 w-4 mr-2" />
                Saved
              </div>
            ) : (
              'Save'
            )}
          </GlassButton>
        </div>

        {/* Quick Presets */}
        <div className="flex space-x-2">
          {[0, 25, 50, 100].map(preset => (
            <button
              key={preset}
              onClick={() => setInputValue(preset.toString())}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPercentage === preset
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
