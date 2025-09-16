export type TemplateOption = {
  id: string;
  title: string;
  description: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

export type Template = TemplateOption;

export type TemplateGroup = TemplateOption & {
  moreAdvanced: React.ReactNode;
  subtitle: string;
} & (
    | {
        type: 'subgroup';
        subtitle: string;
        options: TemplateGroup[];
      }
    | {
        type: 'templates';
        options: Template[];
      }
  );
