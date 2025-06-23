'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  ExternalLink,
  Save,
  Upload,
  Eye,
} from 'lucide-react';
import { GlassButton } from './glass-button';

interface MarketplaceSettings {
  marketplaceName?: string;
  marketplaceDescription?: string;
  marketplaceImageUrl?: string;
  marketplaceUrl?: string;
}

interface MarketplaceSettingsCardProps {
  appId: string;
  appName: string;
  currentSettings: MarketplaceSettings;
  onSave: (settings: MarketplaceSettings) => Promise<void>;
}

export default function MarketplaceSettingsCard({
  appId,
  appName,
  currentSettings,
  onSave,
}: MarketplaceSettingsCardProps) {
  const [settings, setSettings] =
    useState<MarketplaceSettings>(currentSettings);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(currentSettings);

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Marketplace Appearance
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize how your app appears to users in the marketplace
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <GlassButton
            variant="secondary"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </GlassButton>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="bg-background/50 p-6 rounded-lg border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Preview
          </h4>
          <div className="group relative bg-gradient-to-br from-card to-card/95 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden max-w-sm">
            {/* App Icon & Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center mb-4">
                {settings.marketplaceImageUrl ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden mr-4">
                    <img
                      src={settings.marketplaceImageUrl}
                      alt={settings.marketplaceName || appName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mr-4">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">
                    {settings.marketplaceName || appName}
                  </h3>
                  <p className="text-sm text-muted-foreground">Just now</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 h-10 overflow-hidden">
                {settings.marketplaceDescription || 'No description available.'}
              </p>
            </div>

            {/* URL Badge */}
            {settings.marketplaceUrl && (
              <div className="px-6 pb-4">
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-blue-600 text-xs font-medium rounded-full border border-blue-500/20">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Live App
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* App Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={settings.marketplaceName || ''}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  marketplaceName: e.target.value,
                }))
              }
              placeholder={`Default: ${appName}`}
              className="w-full px-3 py-2 border border-input bg-input text-input-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use the default app name: "{appName}"
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={settings.marketplaceDescription || ''}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  marketplaceDescription: e.target.value,
                }))
              }
              placeholder="Describe what your app does and why users should join..."
              rows={4}
              className="w-full px-3 py-2 border border-input bg-input text-input-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This description will be shown to users browsing the marketplace
            </p>
          </div>

          {/* App Image URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              App Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={settings.marketplaceImageUrl || ''}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    marketplaceImageUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/app-logo.png"
                className="flex-1 px-3 py-2 border border-input bg-input text-input-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {settings.marketplaceImageUrl && (
                <div className="w-10 h-10 rounded-md overflow-hidden border border-border">
                  <img
                    src={settings.marketplaceImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 512x512px PNG or JPEG. Leave empty for a default
              icon.
            </p>
          </div>

          {/* App URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              App URL
            </label>
            <input
              type="url"
              value={settings.marketplaceUrl || ''}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  marketplaceUrl: e.target.value,
                }))
              }
              placeholder="https://your-app.com"
              className="w-full px-3 py-2 border border-input bg-input text-input-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Link to where your app is hosted or its website
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Tips for Better Visibility
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Use a clear, descriptive name that explains your app's purpose
              </li>
              <li>
                • Write a compelling description highlighting key benefits
              </li>
              <li>• Add a professional logo or icon for better recognition</li>
              <li>
                • Include your app's URL if you have a live demo or website
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
