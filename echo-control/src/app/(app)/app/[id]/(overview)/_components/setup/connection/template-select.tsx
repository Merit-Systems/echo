import { CodeTabs } from '@/components/ui/shadcn-io/code-tabs';
import { InstallStep } from '../lib/install-step';
import {
  Choicebox,
  ChoiceboxItemTitle,
  ChoiceboxItemDescription,
  ChoiceboxItemHeader,
  ChoiceboxItemContent,
  ChoiceboxItemIndicator,
  ChoiceboxItemSubtitle,
  ChoiceboxItem,
} from '@/components/ui/shadcn-io/choicebox';
import { SiChatbot, SiGooglegemini } from '@icons-pack/react-simple-icons';
import { useState } from 'react';

type Template = {
  template: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const nextTemplates: Template[] = [
  {
    template: 'next-chat',
    label: 'Chat',
    description: 'Next.js + React full-stack chat application.',
    icon: <SiChatbot className="size-4" />,
  },
  {
    template: 'next-image',
    label: 'Image Gen',
    description:
      'Next.js + React full-stack image generation with Gemini + gpt-image-1.',
    icon: <SiGooglegemini className="size-4" />,
  },
];

const reactTemplates: Template[] = [
  {
    template: 'vite-chat',
    label: 'Chat',
    description: 'Vite + React client-side chat application.',
    icon: <SiChatbot className="size-4" />,
  },
  {
    template: 'vite-image',
    label: 'Image Gen',
    description:
      'Vite + React client-side image generation with Gemini + gpt-image-1.',
    icon: <SiGooglegemini className="size-4" />,
  },
];

const TemplateSelect = ({
  templates,
  defaultValue,
  setTemplate,
}: {
  templates: Template[];
  defaultValue: string;
  setTemplate: (template: string) => void;
}) => {
  return (
    <InstallStep
      index={0}
      title="Choose Template"
      description="Choose a starter app."
      body={
        <Choicebox defaultValue={defaultValue} onValueChange={setTemplate}>
          {templates.map(option => (
            <ChoiceboxItem key={option.template} value={option.template}>
              <ChoiceboxItemHeader>
                <ChoiceboxItemTitle>
                  {option.icon}
                  {option.label}
                </ChoiceboxItemTitle>
                <ChoiceboxItemDescription>
                  {option.description}
                </ChoiceboxItemDescription>
              </ChoiceboxItemHeader>
              <ChoiceboxItemContent>
                <ChoiceboxItemIndicator />
              </ChoiceboxItemContent>
            </ChoiceboxItem>
          ))}
        </Choicebox>
      }
    />
  );
};

const Initialize = ({
  appId,
  template,
}: {
  appId: string;
  template: string;
}) => {
  return (
    <InstallStep
      index={1}
      title="Initialize"
      description="Initialize your app with Echo"
      body={
        <CodeTabs
          codes={{
            npm: `npx echo-start@latest --template ${template} --app-id ${appId}`,
            yarn: `yarn dlx echo-start@latest --template ${template} --app-id ${appId}`,
            pnpm: `pnpx echo-start@latest --template ${template} --app-id ${appId}`,
            bun: `bunx echo-start@latest --template ${template} --app-id ${appId}`,
          }}
        />
      }
    />
  );
};

export const NextTemplateSelector = ({ appId }: { appId: string }) => {
  const [template, setTemplate] = useState<string>('next-chat');
  return (
    <>
      <TemplateSelect
        templates={nextTemplates}
        defaultValue="next-chat"
        setTemplate={setTemplate}
      />
      <Initialize appId={appId} template={template} />
    </>
  );
};

export const ReactTemplateSelector = ({ appId }: { appId: string }) => {
  const [template, setTemplate] = useState<string>('vite-chat');
  return (
    <>
      <TemplateSelect
        templates={reactTemplates}
        defaultValue="vite-chat"
        setTemplate={setTemplate}
      />
      <Initialize appId={appId} template={template} />
    </>
  );
};
