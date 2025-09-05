import { useCallback } from 'react';
import { DotPattern } from '../ui/dot-background';
import StepHistory from './StepHistory';
import StepError from './StepError';
import StepControls from './StepControls';
import { StepConfig } from '@/app/(app)/@authenticated/owner/apps/create/page';

export interface StepProps {
  currentStep: number;
  totalSteps: number;
  isTransitioning: boolean;
  error?: string | null;
}

export interface StepComponentProps extends StepProps {
  children: React.ReactNode;
  canProceed: boolean;
  currentStepData: StepConfig | null;
  onNext: () => Promise<void>; // Updated to async
  onBack: () => Promise<void>; // Updated to async since goToBack is now async
  setTransitioning: (isTransitioning: boolean) => void; // From navigation hook
  isSubmitting: boolean;
  isLastStep: boolean;
  formData: Record<string, unknown>;
  steps: StepConfig[];
}

export default function Step({
  currentStep,
  totalSteps,
  isTransitioning,
  error,
  children,
  canProceed,
  currentStepData,
  onNext,
  onBack,
  setTransitioning,
  isSubmitting,
  isLastStep,
  formData,
  steps,
}: StepComponentProps) {
  // Handle transition and then navigate forward
  const handleNext = useCallback(async () => {
    if (isTransitioning || !canProceed) return;

    try {
      // Call the async navigation function directly
      await onNext();
    } catch (error) {
      console.error('Error during step transition:', error);
      // The error will be handled by the navigation hook and displayed
    }
  }, [isTransitioning, canProceed, onNext]);

  // Handle transition and then navigate backward
  const handleBack = useCallback(async () => {
    if (isTransitioning || currentStep === 0) return;

    // Start transition
    setTransitioning(true);

    // Wait for transition to complete
    setTimeout(async () => {
      try {
        await onBack(); // Call navigation hook's goToBack and wait for it
      } catch (error) {
        console.error('Error during back navigation:', error);
      } finally {
        setTransitioning(false);
      }
    }, 300); // Match the CSS transition duration
  }, [isTransitioning, currentStep, setTransitioning, onBack]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <DotPattern
        className="fixed inset-0 text-border/30"
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Main Content Container */}
          <div className="bg-card/60 backdrop-blur-xs rounded-xl border border-border shadow-lg min-h-[500px] flex flex-col p-6 sm:p-8 lg:p-12">
            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 lg:space-y-8">
              <div
                className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
              >
                {children}

                <StepError error={error} />
              </div>

              {/* Controls */}
              <StepControls
                canProceed={canProceed}
                currentStepData={currentStepData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                isLastStep={isLastStep}
              />
              <StepHistory
                formData={formData}
                steps={steps}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
