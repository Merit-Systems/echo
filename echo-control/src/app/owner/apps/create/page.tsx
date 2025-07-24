'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import Step from '../../../../components/creation-flow/Step';
import CreateApplicationStep from '../../../../components/creation-flow/CreateApplicationStep';
// import CallbackUrlStep from '../../../../components/creation-flow/CallbackUrlStep';
import GitHubStep from '../../../../components/creation-flow/GitHubStep';
import ConfigurationStep from '../../../../components/creation-flow/ConfigurationStep';
import TestIntegrationStep from '../../../../components/creation-flow/TestIntegrationStep';
import { useCreationFlowNavigation } from '../../../../components/creation-flow/hooks/useCreationFlowNavigation';
import { useCreateAppComponent } from '../../../../components/creation-flow/hooks/useCreateAppComponent';
// import { useCallbackUrlComponent } from '../../../../components/creation-flow/hooks/useCallbackUrlComponent';
import { useGitHubComponent } from '../../../../components/creation-flow/hooks/useGitHubComponent';
import { useTestIntegrationComponent } from '../../../../components/creation-flow/hooks/useTestIntegrationComponent';

export interface StepConfig {
  key: string;
  prompt: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'github-search' | 'code' | 'verification';
  helpText?: string;
}

const steps: StepConfig[] = [
  {
    key: 'name',
    prompt: 'What would you like to name your application?',
    placeholder: 'My Echo App',
    required: true,
    type: 'text' as const,
  },
  {
    key: 'configuration',
    prompt: 'Review your configuration',
    placeholder: '',
    required: false,
    type: 'code' as const,
  },
  {
    key: 'testing',
    prompt: 'Test your integration',
    placeholder: '',
    required: false,
    type: 'verification' as const,
  },
  // {
  //   key: 'callbackUrl',
  //   prompt: 'What is your production callback URL? (optional)',
  //   placeholder: 'https://yourdomain.com',
  //   required: false,
  //   type: 'text' as const,
  //   helpText:
  //     'Enter the URL where users will be redirected after signing in with Echo from your production app. Localhost URLs (like http://localhost:3000) are automatically allowed for development.',
  // },
  // {
  //   key: 'githubId',
  //   prompt: 'Who should receive proceeds from this app? (optional)',
  //   placeholder: 'Search for a GitHub user or repository...',
  //   required: false,
  //   type: 'github-search' as const,
  // },
];

function CreateApplicationForm() {
  const searchParams = useSearchParams();
  const urlAppId = searchParams.get('appId');

  // Use created app ID if available, otherwise use URL app ID
  const currentAppId = urlAppId || undefined;

  // The navigation hook now manages app state internally
  const {
    currentStep,
    isTransitioning,
    error,
    currentStepData,
    isLastStep,
    app,
    goToNext: goToNextBase,
    goToBack,
    setTransitioning,
    setError,
  } = useCreationFlowNavigation(steps, 0, currentAppId);

  // Step-specific hooks
  const createAppHook = useCreateAppComponent(currentAppId);
  // const callbackUrlHook = useCallbackUrlComponent(
  //   currentAppId || '',
  //   app?.authorizedCallbackUrls?.[0] || ''
  // );
  const githubHook = useGitHubComponent(
    currentAppId || '',
    app?.githubId || '',
    (app?.githubType as 'user' | 'repo') || 'user'
  );
  const testIntegrationHook = useTestIntegrationComponent(currentAppId || '');

  // Get the current step's state
  const getCurrentStepState = () => {
    switch (currentStepData?.key) {
      case 'name':
        return {
          canGoNext: createAppHook.canGoNext,
          update: createAppHook.update,
          error: createAppHook.error,
        };
      // case 'callbackUrl':
      //   return {
      //     canGoNext: callbackUrlHook.canGoNext,
      //     update: callbackUrlHook.update,
      //     error: callbackUrlHook.error,
      //   };
      case 'githubId':
        return {
          canGoNext: githubHook.canGoNext,
          update: githubHook.update,
          error: githubHook.error,
        };
      case 'configuration':
        // Configuration step manages its own state internally via forwardRef
        return {
          canGoNext: true, // It handles its own validation
          update: async () => {}, // No-op, it handles its own updates
          error: null,
        };
      case 'testing':
        return {
          canGoNext: testIntegrationHook.canGoNext,
          update: testIntegrationHook.update,
          error: testIntegrationHook.error,
        };
      default:
        return {
          canGoNext: false,
          update: async () => {},
          error: null,
        };
    }
  };

  const currentStepState = getCurrentStepState();

  // Wrapper function to pass current step state to navigation
  const handleNext = useCallback(async () => {
    await goToNextBase(currentStepState);
  }, [goToNextBase, currentStepState]);

  // Build form data from current app state This is only used for the stepHistory component
  const formData = {
    name: app?.name || createAppHook.stepRef.current?.getValue() || '',
    // callbackUrl: app?.authorizedCallbackUrls?.[0] || '',
    githubId: app?.githubId || '',
    // Add other form fields as needed
  };

  // Don't render step components if we don't have an app for steps that require it
  const requiresApp = [
    'callbackUrl',
    'githubId',
    'configuration',
    'testing',
  ].includes(currentStepData?.key || '');

  if (requiresApp && !app) {
    return (
      <Step
        currentStep={currentStep}
        totalSteps={steps.length}
        isTransitioning={isTransitioning}
        error={error}
        canProceed={false}
        currentStepData={currentStepData}
        onNext={handleNext}
        onBack={goToBack}
        setTransitioning={setTransitioning}
        isSubmitting={false}
        isLastStep={isLastStep}
        formData={formData}
        steps={steps}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary border-t-transparent"></div>
          <span className="text-foreground">Loading app data...</span>
        </div>
      </Step>
    );
  }

  return (
    <Step
      currentStep={currentStep}
      totalSteps={steps.length}
      isTransitioning={isTransitioning}
      error={error}
      canProceed={currentStepState.canGoNext}
      currentStepData={currentStepData}
      onNext={handleNext}
      onBack={goToBack}
      setTransitioning={setTransitioning}
      isSubmitting={false}
      isLastStep={isLastStep}
      formData={formData}
      steps={steps}
    >
      {currentStepData?.key === 'name' ? (
        <CreateApplicationStep
          ref={createAppHook.stepRef}
          isTransitioning={isTransitioning}
          onNext={handleNext}
          onBack={goToBack}
          onError={setError}
          isCreating={createAppHook.isCreating}
          error={createAppHook.error}
          currentAppName={
            app?.name || createAppHook.stepRef.current?.getValue() || ''
          }
        />
      ) : // ) : currentStepData?.key === 'callbackUrl' && app ? (
      //   <CallbackUrlStep
      //     isTransitioning={isTransitioning}
      //     onNext={handleNext}
      //     onBack={goToBack}
      //     onError={setError}
      //     callbackUrl={callbackUrlHook.callbackUrl}
      //     setCallbackUrl={callbackUrlHook.setCallbackUrl}
      //     isUpdating={callbackUrlHook.isUpdating}
      //     error={callbackUrlHook.error}
      //   />
      currentStepData?.key === 'githubId' && app ? (
        <GitHubStep
          isTransitioning={isTransitioning}
          onNext={handleNext}
          onBack={goToBack}
          onError={setError}
          githubId={githubHook.githubId}
          githubType={githubHook.githubType}
          setGithubId={githubHook.setGithubId}
          setGithubType={githubHook.setGithubType}
          isUpdating={githubHook.isUpdating}
          error={githubHook.error}
        />
      ) : currentStepData?.type === 'code' && app ? (
        <ConfigurationStep
          isTransitioning={isTransitioning}
          createdAppId={app.id}
          onNext={handleNext}
          onBack={goToBack}
          onError={setError}
        />
      ) : currentStepData?.type === 'verification' && app ? (
        <TestIntegrationStep
          isTransitioning={isTransitioning}
          createdAppId={app.id}
          onNext={handleNext}
          handleKeyPress={() => handleNext()}
          onBack={goToBack}
          onError={setError}
          integrationVerified={testIntegrationHook.integrationVerified}
          isPolling={testIntegrationHook.isPolling}
          startPolling={testIntegrationHook.startPolling}
          error={testIntegrationHook.error}
        />
      ) : null}
    </Step>
  );
}

export default function CreateApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border shadow-lg p-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary border-t-transparent"></div>
              <span className="text-foreground">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <CreateApplicationForm />
    </Suspense>
  );
}
