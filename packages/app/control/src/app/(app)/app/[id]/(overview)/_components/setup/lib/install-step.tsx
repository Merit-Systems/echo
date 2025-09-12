import React from 'react';

interface InstallStepProps {
  index: number;
  title: string;
  description: string;
  body: React.ReactNode;
}

export const InstallStep: React.FC<InstallStepProps> = ({
  index,
  title,
  description,
  body,
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2 items-center space-y-0">
          <div className="flex items-center justify-center size-5 font-bold rounded-full bg-primary text-primary-foreground shrink-0 text-xs">
            {index + 1}
          </div>
          <h3 className="text-base font-medium">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div>{body}</div>
    </div>
  );
};
