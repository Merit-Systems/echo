import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import z from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidUrl = (string: string) => {
  return z.url().safeParse(string).success;
};

export const formatCurrency = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  if (value < 0.01 && value > 0) {
    return '< $0.01';
  }

  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
};
