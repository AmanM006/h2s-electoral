"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Timeline from '@/components/Timeline';
import Chat from '@/components/Chat';
import LanguageSelector from '@/components/LanguageSelector';
import { LanguageProvider } from '@/components/LanguageContext';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Lazily load the Map component.
 * ssr: false is vital to prevent server-side crashes with window-reliant libraries.
 */
const LazyMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading Map Interface...</span>
    </div>
  ),
});

/**
 * Lazily load the VideoResources component.
 */
const LazyVideos = dynamic(() => import('@/components/VideoResources'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse flex items-center justify-center mt-8">
      <span className="text-gray-400">Loading Educational Videos...</span>
    </div>
  ),
});

/**
 * The main Home page component of Civic Copilot.
 * Assembles Timeline, Chat, Map, and Videos within a unified layout.
 * Wraps everything in the LanguageProvider to support dynamic translations.
 *
 * @returns The main application page.
 */
export default function Home() {
  const [mounted, setMounted] = useState(false);

  // This effect only runs on the client after the first render.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LanguageProvider>
      <main
        id="main-content"
        className="min-h-screen bg-gray-900 font-[family-name:var(--font-geist-sans)] selection:bg-indigo-500/30"
      >
        <div className="bg-gradient-to-b from-indigo-900/50 to-gray-900 border-b border-gray-800">
          <header className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
              <LanguageSelector />
            </div>
            <h1 id="hero-heading" className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 tracking-tight mb-4">
              Civic Copilot
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
              Your interactive guide to the Indian Election Process. Explore the timeline, find your polling station, and ask questions.
            </p>
          </header>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-24">
          {/* Timeline Section */}
          <section aria-labelledby="timeline-heading" className="scroll-mt-16">
            <Suspense fallback={<div className="h-96 bg-gray-800 rounded-xl animate-pulse" />}>
              <ErrorBoundary>
                <Timeline />
              </ErrorBoundary>
            </Suspense>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Chat Section */}
            <section aria-labelledby="chat-heading" className="scroll-mt-16">
              <Suspense fallback={<div className="h-[600px] bg-gray-800 rounded-xl animate-pulse" />}>
                <ErrorBoundary>
                  <Chat />
                </ErrorBoundary>
              </Suspense>
            </section>

            {/* Map Section - Only renders once mounted to avoid hydration mismatch */}
            <section aria-labelledby="map-heading" className="scroll-mt-16">
              {mounted ? (
                <Suspense fallback={<div className="h-[400px] bg-gray-800 rounded-xl animate-pulse" />}>
                  <ErrorBoundary>
                    <LazyMap />
                  </ErrorBoundary>
                </Suspense>
              ) : (
                <div className="h-[400px] bg-gray-800 rounded-xl border border-gray-700/50" />
              )}
            </section>
          </div>

          {/* Videos Section - Only renders once mounted */}
          <section aria-labelledby="videos-heading" className="scroll-mt-16">
            {mounted ? (
              <Suspense fallback={<div className="h-64 bg-gray-800 rounded-xl animate-pulse" />}>
                <ErrorBoundary>
                  <LazyVideos />
                </ErrorBoundary>
              </Suspense>
            ) : (
              <div className="h-64 bg-gray-800 rounded-xl border border-gray-700/50" />
            )}
          </section>
        </div>

        <footer className="bg-gray-950 border-t border-gray-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Civic Copilot. Based on Election Commission of India guidelines.
            </p>
          </div>
        </footer>
      </main>
    </LanguageProvider>
  );
}