import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing"),
  GOOGLE_TRANSLATE_API_KEY: z.string().min(1, "GOOGLE_TRANSLATE_API_KEY is missing").optional(),
  YOUTUBE_API_KEY: z.string().min(1, "YOUTUBE_API_KEY is missing").optional(),
});

export const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
});
