import { Template as TemplateType } from './types';
import { motion } from 'motion/react';
import { CodeTabs } from '@/components/ui/shadcn-io/code-tabs';

interface Props {
  appId: string;
  template: TemplateType;
  index: number;
}

export const Template: React.FC<Props> = ({ template, appId, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-2 bg-muted p-4"
    >
      <h3 className="text-sm font-bold">
        {index + 1}) Run the {template.title} Creation Script
      </h3>
      <CodeTabs
        codes={{
          npm: `npx echo-start@latest --template ${template.id} --app-id ${appId}`,
          pnpm: `pnpm dlx echo-start@latest --template ${template.id} --app-id ${appId}`,
          yarn: `yarn dlx echo-start@latest --template ${template.id} --app-id ${appId}`,
          bun: `bunx echo-start@latest --template ${template.id} --app-id ${appId}`,
        }}
        className="border-primary bg-card"
      />
    </motion.div>
  );
};
