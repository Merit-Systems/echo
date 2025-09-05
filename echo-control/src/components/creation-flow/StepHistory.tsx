import { ChevronRight } from 'lucide-react';
import { StepConfig } from '@/app/(app)/@authenticated/owner/apps/create/page';

interface StepHistoryProps {
  formData: Record<string, unknown>;
  steps: StepConfig[];
  currentStep: number;
}

export default function StepHistory({
  formData,
  steps,
  currentStep,
}: StepHistoryProps) {
  // Don't render if no form data or we're on the first step
  if (!formData || currentStep <= 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="space-y-2">
        {steps.slice(0, currentStep).map(step => {
          const value = formData[step.key as keyof typeof formData];

          // Convert non-string values to displayable strings
          let displayValue: string;
          if (typeof value === 'string') {
            displayValue = value || 'completed';
          } else if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else if (value && typeof value === 'object') {
            // For GitHub metadata, show the name/login
            if ('login' in value) {
              displayValue = `@${value.login}`;
            } else if ('full_name' in value) {
              displayValue = (value.full_name as string) || 'completed';
            } else {
              displayValue = 'completed';
            }
          } else {
            displayValue = 'completed';
          }

          return (
            <div
              key={step.key}
              className="flex items-start sm:items-center space-x-3 text-sm"
            >
              <ChevronRight className="h-4 w-4 text-primary mt-0.5 sm:mt-0 shrink-0" />
              <span className="text-muted-foreground shrink-0">
                {step.prompt}
              </span>
              <span className="text-primary break-all">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
