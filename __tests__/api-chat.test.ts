/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock the env to avoid needing real API keys during tests
jest.mock('@/lib/env', () => ({
  env: {
    GEMINI_API_KEY: 'mock-api-key'
  }
}));

// Mock @google/genai — the mock factory must not reference variables that
// are not yet initialized (Jest hoists jest.mock() before declarations).
// We expose the mock function via the module's internal state instead.
jest.mock('@google/genai', () => {
  const mockGenerateContentStream = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: { generateContentStream: mockGenerateContentStream }
    })),
    // Expose for retrieval in tests
    __getMock: () => mockGenerateContentStream,
  };
});

/** Helper to retrieve the hoisted mock function after module load. */
function getStreamMock(): jest.Mock {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@google/genai').__getMock();
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject requests with missing messages array', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid request payload');
  });

  it('should process valid requests and stream the response', async () => {
    // Create an async generator to simulate the Gemini stream
    async function* mockStream() {
      yield { text: 'Hello ' };
      yield { text: 'World!' };
    }

    getStreamMock().mockResolvedValueOnce(mockStream());

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hello' }]
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');

    // Read the streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultText = '';
    
    if (reader) {
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          resultText += decoder.decode(value, { stream: true });
        }
      }
    }

    expect(resultText).toBe('Hello World!');
  });
});
