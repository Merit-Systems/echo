import z from 'zod';

export type PaginationParams = {
  page: number;
  page_size: number;
};

interface ToPaginatedResponseParams<T> {
  items: T[];
  page: number;
  page_size: number;
  total_count: number;
}

type PaginatedResponse<T> = {
  items: T[];
  page_size: number;
  page: number;
  total_count: number;
  has_next: boolean;
};

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

interface ToTimeBasedPaginatedReponseParams<T> {
  items: T[];
  cursor: Date;
  limit: number;
}

type TimeBasedPaginatedResponse<T> = ToTimeBasedPaginatedReponseParams<T> & {
  has_next: boolean;
};

export const toTimeBasedPaginatedReponse = <T>({
  items,
  cursor,
  limit,
}: ToTimeBasedPaginatedReponseParams<T>): TimeBasedPaginatedResponse<T> => {
  return {
    items: items.slice(0, limit),
    cursor,
    limit,
    has_next: items.length > limit,
  };
};
