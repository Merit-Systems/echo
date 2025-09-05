'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  Key,
  BarChart,
  Shield,
  ChevronRight,
  Users,
  DollarSign,
  Palette,
  BookOpen,
  Gift,
} from 'lucide-react';

// Import individual settings components
import GeneralSettings from '@/components/settings/GeneralSettings';
import PersonalizationSettings from '@/components/settings/PersonalizationSettings';
import ApiKeysSettings from '@/components/settings/ApiKeysSettings';
import AnalyticsSettings from '@/components/settings/AnalyticsSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import UsersSettings from '@/components/settings/UsersSettings';
import EarningsSettings from '@/components/settings/EarningsSettings';
import DocumentationSettings from '@/components/settings/DocumentationSettings';
import FreeTierCreditsSettings from '@/components/settings/FreeTierCreditsSettings';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Settings className="h-4 w-4" />,
    description: 'Markup settings and basic configuration',
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'Manage documentation links and guides for your app',
  },
  {
    id: 'personalization',
    label: 'Personalization',
    icon: <Palette className="h-4 w-4" />,
    description: 'App name, images, and branding customization',
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: <Key className="h-4 w-4" />,
    description: 'View and manage API keys for your app',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart className="h-4 w-4" />,
    description: 'Usage metrics and performance data',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'LLM transaction earnings and revenue details',
  },
  {
    id: 'free-tier-credits',
    label: 'Free Tier Credits',
    icon: <Gift className="h-4 w-4" />,
    description: 'Purchase shared credits for all app users',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
    description: 'All active users of your app with usage details',
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="h-4 w-4" />,
    description: 'OAuth configuration and security settings',
  },
];

export default function SettingsPage() {
  const params = useParams();
  const appId = params.appId as string;
  const [activeTab, setActiveTab] = useState('general');
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch app name for components that need it
  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const response = await fetch(`/api/apps/${appId}`);
        if (response.ok) {
          const data = await response.json();
          setAppName(data.name || 'Unknown App');
        }
      } catch (error) {
        console.error('Error fetching app name:', error);
        setAppName('Unknown App');
      } finally {
        setLoading(false);
      }
    };

    fetchAppName();
  }, [appId]);

  const renderSettingsComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return <GeneralSettings appId={appId} />;
      case 'personalization':
        return (
          <PersonalizationSettings appId={appId} initialAppName={appName} />
        );
      case 'api-keys':
        return <ApiKeysSettings appId={appId} appName={appName} />;
      case 'analytics':
        return <AnalyticsSettings appId={appId} />;
      case 'earnings':
        return <EarningsSettings appId={appId} />;
      case 'free-tier-credits':
        return <FreeTierCreditsSettings appId={appId} />;
      case 'users':
        return <UsersSettings appId={appId} />;
      case 'documentation':
        return <DocumentationSettings />;
      case 'security':
        return <SecuritySettings appId={appId} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Settings component not found
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">App Dashboard</h1>
        <p className="text-foreground">
          Manage your application configuration and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-primary/80 rounded-none ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground border-r-2 border-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {activeTab === item.id && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="space-y-4">{renderSettingsComponent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
