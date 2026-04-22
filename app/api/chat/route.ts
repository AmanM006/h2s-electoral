import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

/**
 * Initializes the Google Gen AI client with the provided API key.
 */
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Zod schema to validate incoming chat request payload.
 * Ensures the messages array has a valid structure and limits to prevent abuse.
 */
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string().max(1000, "Message is too long")
  })).max(50, "Too many messages in history"),
  language: z.string().optional()
});

/**
 * POST handler for the /api/chat route.
 * Validates incoming chat messages and streams a response from the Gemini model.
 * 
 * @param req The Next.js request object containing the JSON payload with messages.
 * @returns A streaming NextResponse or a JSON error response.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request payload
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parsed.error.format() }, { status: 400 });
    }

    const { messages, language } = parsed.data;

    // Convert messages for Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const langInstruction = language && language !== 'en' ? ` Please respond entirely in the language code: ${language}.` : '';

    /**
     * Request streaming generation from Gemini.
     */
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: "You are Civic Copilot, an expert on the Indian Election process. Provide neutral, factual, and educational guidance based on Election Commission of India standards. Be concise and use simple language." + langInstruction,
      }
    });

    /**
     * Create a standard Web Streams API ReadableStream to chunk the response.
     */
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
