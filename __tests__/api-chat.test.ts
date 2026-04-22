/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock the env and GoogleGenAI to avoid needing real API keys during tests
jest.mock('@/lib/env', () => ({
  env: {
    GEMINI_API_KEY: 'mock-api-key'
  }
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: 'Mocked response' })
    }
  }))
}));

describe('POST /api/chat', () => {
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

  it('should reject messages with invalid roles', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'admin', content: 'hello' }]
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should reject messages exceeding length limit', async () => {
    const longString = 'a'.repeat(1001);
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: longString }]
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should process valid requests', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is Lok Sabha?' }]
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.role).toBe('model');
    expect(data.content).toBe('Mocked response');
  });
});
