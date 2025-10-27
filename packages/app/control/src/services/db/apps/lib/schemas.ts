import { z } from 'zod';

export const appIdSchema = z.uuid();

export type AppId = z.infer<typeof appIdSchema>;

export const createAppSchema = z.object({
  name: z
    .string()
    .min(1, 'App name is required')
    .max(100, 'App name must be 100 characters or less'),
  markup: z
    .number()
    .min(1, 'Markup must be greater than 0')
    .max(100, 'Markup must be less than 100'),
});

export const updateAppSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    homepageUrl: z.url().optional(),
    profilePictureUrl: z.url().optional(),
    authorizedCallbackUrls: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    hideOwnerName: z.boolean().optional(),
  })
  .refine(data => Object.values(data).some(value => value !== undefined), {
    message: 'At least one field must be provided',
    path: [],
  });

export const updateMarkupSchema = z.object({
  markup: z
    .number()
    .min(1, 'Markup must be at least 1x')
    .max(10, 'Markup cannot exceed 10x (1000%)'),
});
