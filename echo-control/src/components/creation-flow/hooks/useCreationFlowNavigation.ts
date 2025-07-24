import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentApp } from '../../../hooks/useCurrentApp';
import {
  OwnerEchoApp,
  PublicEchoApp,
  CustomerEchoApp,
} from '../../../lib/echo-apps/types';

type AppUnion = PublicEchoApp | CustomerEchoApp | OwnerEchoApp;

interface StepConfig {
  key: string;
  prompt: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'github-search' | 'code' | 'verification';
  helpText?: string;
}

interface StepState {
  canGoNext: boolean;
  update: () => Promise<void>;
  error: string | null;
}

interface UseCreationFlowNavigationReturn {
  currentStep: number;
  isTransitioning: boolean;
  error: string | null;
  currentStepData: StepConfig | null;
  isLastStep: boolean;
  app: AppUnion | null; // Changed from OwnerEchoApp to AppUnion to match useCurrentApp return type
  isLoadingApp: boolean; // Loading state from useCurrentApp
  appError: string | null; // Error state from useCurrentApp
  goToNext: (stepState: StepState) => Promise<void>;
  goToBack: () => Promise<void>;
  setTransitioning: (isTransitioning: boolean) => void;
  setError: (error: string | null) => void;
  refetchAppState: () => Promise<void>;
}

export function useCreationFlowNavigation(
  steps: StepConfig[],
  initialStep: number = 0,
  appId?: string
): UseCreationFlowNavigationReturn {
  const router = useRouter();

  // Use useCurrentApp internally to manage app state
  const {
    app,
    isLoading: isLoadingApp,
    error: appError,
    refetch,
  } = useCurrentApp(appId);

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStepData = steps[currentStep] || null;
  const isLastStep = currentStep === steps.length - 1;

  const refetchAppState = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const goToNext = useCallback(
    async (stepState: StepState) => {
      // Check if current step can proceed
      if (!stepState.canGoNext) {
        return;
      }

      try {
        setError(null);
        setIsTransitioning(true);

        // Call the step's update method
        await stepState.update();

        if (isLastStep) {
          if (appId) {
            router.push(`/owner/${appId}/settings`);
          } else {
            router.push(`/`);
          }
        }
        // Refetch app state after update and wait for it to complete
        await refetchAppState();

        setCurrentStep(prev => prev + 1);

        // Navigate to next step or finish
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsTransitioning(false);
      }
    },
    [isLastStep, appId, router, refetchAppState]
  );

  const goToBack = useCallback(async () => {
    if (currentStep === 0) return;

    setCurrentStep(prev => prev - 1);
    setError(null);
    await refetchAppState();
  }, [currentStep, refetchAppState]);

  const setTransitioningCallback = useCallback((transitioning: boolean) => {
    setIsTransitioning(transitioning);
  }, []);

  const handleSetError = useCallback((error: string | null) => {
    setError(error);
  }, []);

  return {
    currentStep,
    isTransitioning,
    error,
    currentStepData,
    isLastStep,
    app,
    isLoadingApp,
    appError,
    goToNext,
    goToBack,
    setTransitioning: setTransitioningCallback,
    setError: handleSetError,
    refetchAppState,
  };
}
