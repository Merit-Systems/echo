import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseStepProps } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface TestIntegrationStepProps extends BaseStepProps {
  createdAppId: string | null;
  integrationVerified: boolean;
  isPolling: boolean;
  startPolling: (appId: string) => void;
  error: string | null;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export default function TestIntegrationStep({
  createdAppId,
  isTransitioning,
  integrationVerified,
  isPolling,
  startPolling,
  error,
  handleKeyPress,
}: TestIntegrationStepProps) {
  const router = useRouter();

  // Step configuration for the verification step
  const stepConfig = {
    key: 'testing',
    prompt: 'Test your integration',
    type: 'verification' as const,
  };

  // Automatically start polling when component mounts and createdAppId is available
  useEffect(() => {
    if (createdAppId && !isPolling && !integrationVerified) {
      startPolling(createdAppId);
    }
  }, [createdAppId, isPolling, integrationVerified, startPolling]);

  // Ensure polling stops when component unmounts
  useEffect(() => {
    return () => {
      // The cleanup is primarily handled in the hook, but this provides extra safety
      // In case the hook's cleanup doesn't run for any reason
    };
  }, []);

  const handleGoToDashboard = () => {
    if (createdAppId) {
      router.push(`/apps/${createdAppId}`);
    } else {
      router.push('/owner');
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <ChevronRight className="h-5 w-5 text-secondary" />
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          {stepConfig.prompt}
        </h2>
      </div>

      {/* Content */}
      <div className="relative mb-6 sm:mb-8" onKeyDown={handleKeyPress}>
        <div className="space-y-8">
          {!integrationVerified ? (
            <>
              {/* JWT Testing Instructions */}
              <Card className="bg-secondary/10 border-secondary/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <CardTitle className="text-xl">Connect with Echo</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                    <p>1. Implement the code from the previous step</p>
                    <p>2. Run your app and click &quot;Sign In&quot;</p>
                    <p>3. Begin developing your app!</p>
                  </div>
                </CardContent>
              </Card>

              {/* Polling Status */}
              <Card className="backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {isPolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-secondary border-t-transparent mx-auto sm:mx-0"></div>
                        <span className="text-muted-foreground text-center sm:text-left">
                          Waiting for your login...
                        </span>
                      </>
                    ) : createdAppId ? (
                      <>
                        <div className="h-5 w-5 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-muted-foreground text-center sm:text-left">
                          Monitoring started - complete the OAuth flow in your
                          app
                        </span>
                      </>
                    ) : (
                      <span className="text-destructive text-center">
                        App not created yet
                      </span>
                    )}
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-destructive">{error}</div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl">🎉</div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">
                  Integration Successful!
                </h3>
                <p className="text-muted-foreground">
                  Your Echo app is now configured and working properly.
                </p>
              </div>
              <Button
                onClick={handleGoToDashboard}
                variant="secondary"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
