import { db } from '@/services/db/client';

import type z from 'zod';
import type { Sql } from '@prisma/client/runtime/library';

export const queryRaw = async <T>(sql: Sql, resultSchema: z.ZodSchema<T>) => {
  const result = await db.$queryRaw<T>(sql);

  const parseResult = resultSchema.safeParse(result);

  if (!parseResult.success) {
    // console.error(parseResult.error.issues);
    throw new Error('Invalid result: ' + parseResult.error.message);
  }

  return parseResult.data;
};
