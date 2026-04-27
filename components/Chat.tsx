'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Copy, Check } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy'}
      className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors focus:outline-none"
    >
      {copied ? (
        <>
          <Check size={10} className="text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Copy size={10} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function Chat() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Namaste. I am Civic Copilot. How can I assist with your electoral queries today?' }
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
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language }),
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      while (reader && !done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = text;
            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'An error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, language]);

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <div
        key={index}
        className={`flex w-full mb-8 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex max-w-[90%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border border-border-subtle ${msg.role === 'user' ? 'bg-white' : 'bg-black'}`}>
            {msg.role === 'user' ? <User size={14} className="text-black" /> : <Bot size={14} className="text-white" />}
          </div>
          <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-card border border-border-subtle text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'model' && msg.content && index > 0 && <CopyButton text={msg.content} />}
          </div>
        </div>
      </div>
    ));
  }, [messages]);

  return (
    <div className="bg-card rounded-2xl border border-border-subtle flex flex-col h-[600px] overflow-hidden shadow-2xl">
      <header className="px-6 py-4 border-b border-border-subtle bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <h2 id="chat-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Assistant</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth" aria-live="polite" aria-atomic="true">
        {renderedMessages}
        {isLoading && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start mb-8 animate-fadeIn">
            <div className="flex flex-row max-w-[90%] gap-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-black border border-border-subtle flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="p-4 rounded-xl bg-card border border-border-subtle flex items-center gap-3">
                <Loader2 size={12} className="animate-spin text-gray-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Processing</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-black/50 border-t border-border-subtle">
        <div className="relative flex items-center">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query..."
            disabled={isLoading}
            className="w-full bg-black text-white border border-border-subtle rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
            className="absolute right-2 p-3 text-gray-500 hover:text-white disabled:opacity-0 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
