import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';

/**
 * Zod schema to validate translation requests.
 */
const translateRequestSchema = z.object({
  text: z.union([z.string(), z.array(z.string())]).describe("The text or array of texts to translate"),
  target: z.string().describe("The target language code (e.g., 'hi' for Hindi)"),
});

/**
 * POST handler for the /api/translate route.
 * Translates the provided text to the target language using Google Cloud Translation API.
 * 
 * @param req The Next.js request object containing the text and target language.
 * @returns A JSON response with the translated text.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = translateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { text, target } = parsed.data;

    // Do not translate if it's already English or no key is provided
    if (target === 'en' || !env.GOOGLE_TRANSLATE_API_KEY) {
      return NextResponse.json({ translatedText: text });
    }

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${env.GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: target,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Translation API error:', errorData);
      throw new Error('Failed to translate');
    }

    const data = await response.json();
    
    // API returns data.data.translations array
    const translations = data.data.translations;
    
    if (Array.isArray(text)) {
      return NextResponse.json({ translatedText: translations.map((t: any) => t.translatedText) });
    } else {
      return NextResponse.json({ translatedText: translations[0].translatedText });
    }

  } catch (error) {
    console.error('Error in translate route:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
