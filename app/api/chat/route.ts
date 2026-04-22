import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string().max(1000, "Message is too long")
  })).max(50, "Too many messages in history")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request payload
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parsed.error.format() }, { status: 400 });
    }

    const { messages } = parsed.data;

    // Convert messages for Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: "You are Civic Copilot, an expert on the Indian Election process. Provide neutral, factual, and educational guidance based on Election Commission of India standards. Be concise and use simple language.",
      }
    });

    if (!response.text) {
      throw new Error("No response from model");
    }

    return NextResponse.json({ role: 'model', content: response.text });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
