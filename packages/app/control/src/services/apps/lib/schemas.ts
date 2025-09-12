import { z } from 'zod';

export const appIdSchema = z.uuid();

export type AppId = z.infer<typeof appIdSchema>;
