import { z } from 'zod';

export const userIdSchema = z.uuid();

export type UserId = z.infer<typeof userIdSchema>;
