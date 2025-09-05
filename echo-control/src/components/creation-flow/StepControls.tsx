import { useEffect } from 'react';
import StepCanProceed from './StepCanProceed';
import { StepConfig } from '@/app/(app)/@authenticated/owner/apps/create/page';

interface StepControlsProps {
  canProceed: boolean;
  currentStepData: StepConfig | null;
  handleNext: () => Promise<void>; // Fix: Make this async
  handleBack: () => void;
  currentStep: number;
  isSubmitting?: boolean;
  isLastStep: boolean;
}

export default function StepControls({
  canProceed,
  currentStepData,
  handleNext,
  handleBack,
  currentStep,
  isSubmitting = false,
  isLastStep,
}: StepControlsProps) {
  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (canProceed && currentStepData && !isSubmitting) {
          await handleNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (!isSubmitting) {
          handleBack();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canProceed, currentStepData, handleNext, handleBack, isSubmitting]);

  // Handle click events for keyboard shortcuts
  const handleNextClick = async () => {
    if (canProceed && currentStepData && !isSubmitting) {
      await handleNext();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-muted-foreground">
          <span>Press</span>
          <kbd
            className="px-3 py-1.5 text-xs bg-muted/50 rounded border border-border text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={handleNextClick}
          >
            Enter
          </kbd>
          <span>to continue</span>
        </div>

        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-muted-foreground">
          <span>Press</span>
          <kbd
            className="px-3 py-1.5 text-xs bg-muted/50 rounded border border-border text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={handleBack}
          >
            Esc
          </kbd>
          <span>to {currentStep === 0 ? 'cancel' : 'go back'}</span>
        </div>
      </div>

      <div
        className={`transition-opacity duration-300 ${canProceed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <StepCanProceed
          onClick={handleNextClick}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
        />
      </div>
    </div>
  );
}
