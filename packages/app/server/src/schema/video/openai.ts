import { z } from "zod";

const modelSchema = z.enum(["sora-2" ,"sora-2-pro"]);

export const OpenAIVideoCreateParamsSchema = z.object({
    model: modelSchema,
    prompt: z.string().nonoptional(),
    seconds: z.union([z.literal(4), z.literal(8), z.literal(12)]),
    size: z.string().optional(),
});

export const OpenAIVideoSchema = z.object({
    id: z.string(),
    object: z.literal("video"),
    status: z.enum(["queued", "in_progress", "completed", "failed"]),
    progress: z.number().min(0).max(100).optional(),
    created_at: z.number(),
    completed_at: z.number().nullable(),
    expires_at: z.number().optional(),
    model: modelSchema,
    remixed_from_video_id: z.string().optional(),
    seconds: z.union([z.literal(4), z.literal(8), z.literal(12)]).optional(),
    size: z.string().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        param: z.string().nullable().optional(),
    }).nullable(),
});