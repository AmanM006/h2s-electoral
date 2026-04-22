'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Namaste! I am Civic Copilot, your guide to the Indian Election process. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: data.role, content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <div
        key={index}
        className={`flex w-full mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-emerald-600 mr-3'}`}>
            {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
          </div>
          <div className={`p-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      </div>
    ));
  }, [messages]);

  return (
    <section aria-labelledby="chat-heading" className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-[600px] overflow-hidden">
          <header className="bg-gray-900 p-4 border-b border-gray-700 flex items-center">
            <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
              <Bot className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 id="chat-heading" className="text-xl font-bold text-white">Civic Copilot</h2>
              <p className="text-sm text-gray-400">Election Commission of India AI Guide</p>
            </div>
          </header>

          <div
            className="flex-1 overflow-y-auto p-6 bg-gray-800/50"
            aria-live="polite"
            role="log"
          >
            {renderedMessages}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex flex-row max-w-[80%]">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-600 mr-3 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-700 text-gray-100 rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-400" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-700 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about voter registration, election phases..."
              aria-label="Chat input message"
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white p-3 rounded-xl transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
