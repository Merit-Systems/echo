import type { NextErrorProps } from '@/types/next-error';
import type { LucideIcon } from 'lucide-react';

export interface ErrorComponentProps {
  errorProps?: NextErrorProps;
  title?: string;
  description?: string;
  Icon?: LucideIcon;
  actions?: React.ReactNode;
}
