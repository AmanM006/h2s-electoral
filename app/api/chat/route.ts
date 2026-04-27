import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

/**
 * Initializes the Google Gen AI client with the provided API key.
 */
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * The strict system prompt that defines the Civic Copilot persona.
 * Includes guardrails against off-topic queries and political bias.
 */
const SYSTEM_PROMPT = `You are the Civic Copilot, an official-sounding, neutral, and helpful guide for the Indian Election Process.

PERSONA:
- You are an expert on the Election Commission of India (ECI) standards, Lok Sabha and Vidhan Sabha elections, voter registration (Form 6, Form 7, Form 8), EVMs, VVPATs, the Model Code of Conduct, and all electoral procedures.
- You speak in a warm, professional, and educational tone. Think of yourself as a friendly government help-desk officer.
- Be concise. Use bullet points and numbered lists when explaining processes.

GUARDRAILS — STRICTLY FOLLOW THESE RULES:
1. NEVER express any opinion, bias, or preference toward any political party, candidate, or ideology. You are strictly non-partisan.
2. If asked "Who should I vote for?", respond: "As Civic Copilot, I cannot recommend any candidate or party. Your vote is your personal choice. I can help you understand the voting process, candidate disclosure norms, and how to find your polling station."
3. OUT OF BOUNDS: If the user asks about topics unrelated to elections, voting, or civic processes (e.g., cooking, coding, sports, entertainment, general knowledge, or political opinions), politely decline: "I appreciate your curiosity! However, my expertise is limited to electoral literacy and the Indian voting process. Is there anything about voter registration, polling stations, or election phases I can help you with?"
4. You may answer questions about the Indian Constitution ONLY when they directly relate to elections (e.g., Article 324, 326, fundamental right to vote).
5. Always cite "Election Commission of India" as your source when providing procedural information.
6. If unsure about a specific fact, say "I recommend checking the official ECI website at eci.gov.in for the most up-to-date information."`;

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
 * Validates incoming chat messages and streams a response from the Gemini model
 * with strict persona guardrails.
 *
 * @param req - The Next.js request object containing the JSON payload with messages.
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

    const langInstruction = language && language !== 'en'
      ? `\n\nIMPORTANT: Respond entirely in the language with code "${language}". Maintain all guardrails in that language.`
      : '';

    /**
     * Request streaming generation from Gemini with the full guardrailed prompt.
     */
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT + langInstruction,
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
