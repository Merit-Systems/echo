import React from 'react';
import { TemplateOption } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface Props {
  title: string;
  options: TemplateOption[];
  selectedId: string | undefined;
  setSelectedId: (id: string) => void;
  index: number;
  moreAdvanced?: React.ReactNode;
}

export const OptionButtons: React.FC<Props> = ({
  title,
  options,
  selectedId,
  setSelectedId,
  index,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 md:p-4 pb-1 md:pb-2">
      <h2 className="text-sm font-semibold">
        {index + 1}) {title}
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 md:gap-4"
      >
        {options.map(option => (
          <Button
            key={option.id}
            variant={'outline'}
            onClick={() => setSelectedId(option.id)}
            className={cn(
              'flex-1 h-fit md:h-fit py-4 px-4 flex-col gap-2 items-start hover:bg-primary/5 hover:border-primary/60 overflow-hidden text-left',
              selectedId === option.id &&
                'bg-primary/10 border-primary hover:bg-primary/10'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2',
                selectedId === option.id && 'text-primary'
              )}
            >
              <option.Icon className="size-6" />
              <h3
                className={cn(
                  'text-lg font-bold',
                  selectedId === option.id && 'text-primary'
                )}
              >
                {option.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground/80 text-wrap">
              {option.description}
            </p>
          </Button>
        ))}
      </motion.div>
    </div>
  );
};
