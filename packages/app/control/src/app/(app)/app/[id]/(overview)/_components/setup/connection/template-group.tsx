import React, { useState } from 'react';

import { OptionButtons } from './option-buttons';
import { Template } from './template';

import type { TemplateGroup as TemplateGroupType } from './types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props {
  templateGroup: TemplateGroupType;
  appId: string;
  index: number;
}

export const TemplateGroup: React.FC<Props> = ({
  templateGroup,
  appId,
  index,
}) => {
  const [selectedId, setSelectedId] = useState<string>();

  const selectedOption = templateGroup.options.find(
    template => template.id === selectedId
  );

  return (
    <>
      <OptionButtons
        title={templateGroup.subtitle}
        options={templateGroup.options}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        index={index}
      />
      <p className="px-4 text-sm text-muted-foreground pb-2 md:pb-4 opacity-60">
        {templateGroup.moreAdvanced}
      </p>
      <motion.div
        initial={{ height: 0 }}
        animate={{
          height: selectedOption ? 'auto' : 0,
        }}
        className={cn(
          'border-t border-transparent',
          selectedOption && 'border-border'
        )}
      >
        {selectedOption &&
          (templateGroup.type === 'templates' ? (
            <Template
              template={selectedOption}
              appId={appId}
              key={selectedId}
              index={index + 1}
            />
          ) : (
            <TemplateGroup
              templateGroup={selectedOption as TemplateGroupType}
              appId={appId}
              key={selectedId}
              index={index + 1}
            />
          ))}
      </motion.div>
    </>
  );
};
