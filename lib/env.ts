import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is missing"),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing"),
});

export const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
});
