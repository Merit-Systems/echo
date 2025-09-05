import z from 'zod';

import { PaginatedResponse } from '@/types/paginated-response';

export const paginationSchema = z.object({
  page: z.number().optional().default(0),
  page_size: z.number().optional().default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

interface ToPaginatedResponseParams<T> {
  items: T[];
  page: number;
  page_size: number;
  total_count: number;
}

export const toPaginatedReponse = <T>({
  items,
  page,
  page_size,
  total_count,
}: ToPaginatedResponseParams<T>): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total_count / page_size);
  return {
    items,
    page,
    page_size,
    total_count,
    has_next: page < totalPages - 1,
  };
};

export const timeBasedPaginationSchema = z.object({
  cursor: z.date().optional().default(new Date()),
  limit: z.number().optional().default(10),
});

export type TimeBasedPaginationParams = z.infer<
  typeof timeBasedPaginationSchema
>;

export interface ToTimeBasedPaginatedReponseParams<T> {
  items: T[];
  cursor: Date;
  limit: number;
}

export type TimeBasedPaginatedResponse<T> =
  ToTimeBasedPaginatedReponseParams<T> & {
    has_next: boolean;
  };

export const toTimeBasedPaginatedReponse = <T>({
  items,
  cursor,
  limit,
}: ToTimeBasedPaginatedReponseParams<T>): TimeBasedPaginatedResponse<T> => {
  return {
    items,
    cursor,
    limit,
    has_next: items.length > limit,
  };
};
