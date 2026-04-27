"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Timeline from '@/components/Timeline';
import Chat from '@/components/Chat';
import LanguageSelector from '@/components/LanguageSelector';
import { LanguageProvider } from '@/components/LanguageContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthButton from '@/components/AuthButton';

const LazyMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-card rounded-2xl animate-pulse border border-border-subtle flex items-center justify-center">
      <span className="text-gray-500 text-sm font-medium">Initializing Map...</span>
    </div>
  ),
});

const LazyVideos = dynamic(() => import('@/components/VideoResources'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-card rounded-2xl animate-pulse border border-border-subtle flex items-center justify-center mt-8">
      <span className="text-gray-500 text-sm font-medium">Loading Resources...</span>
    </div>
  ),
});

const LazyCitizenDashboard = dynamic(() => import('@/components/CitizenDashboard'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-card rounded-2xl animate-pulse border border-border-subtle flex items-center justify-center">
      <span className="text-gray-500 text-sm font-medium">Loading Citizen Dashboard...</span>
    </div>
  ),
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <LanguageProvider>
      <main
        id="main-content"
        className="min-h-screen bg-background text-foreground selection:bg-accent/30"
      >
        {/* Minimalistic Header */}
        <div className="border-b border-border-subtle bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="font-bold text-lg tracking-tight">CIVIC COPILOT</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <AuthButton />
            </div>
          </div>
        </div>

        {/* Citizen Dashboard — top of content, auth-gated */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          {mounted ? (
            <Suspense fallback={<div className="h-96 bg-card rounded-2xl animate-pulse border border-border-subtle" />}>
              <ErrorBoundary>
                <LazyCitizenDashboard />
              </ErrorBoundary>
            </Suspense>
          ) : (
            <div className="h-96 bg-card rounded-2xl border border-border-subtle" />
          )}
        </div>

        {/* Hero Section */}
        <header className="max-w-4xl mx-auto px-6 py-24 text-center animate-fadeIn">
          <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Electoral Literacy.<br />
            <span className="text-gray-500">Simplified for everyone.</span>
          </h1>
          <p className="max-w-xl text-lg text-gray-400 mx-auto leading-relaxed">
            Your interactive guide to the Indian Election Process. Explore the timeline, locate polling stations, and get AI-powered assistance.
          </p>
        </header>

        <div className="max-w-7xl mx-auto px-6 pb-24 space-y-32">
          {/* Timeline Section */}
          <section aria-labelledby="timeline-heading" className="scroll-mt-24">
            <Suspense fallback={<div className="h-96 bg-card rounded-2xl animate-pulse border border-border-subtle" />}>
              <ErrorBoundary>
                <Timeline />
              </ErrorBoundary>
            </Suspense>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Chat Section */}
            <section aria-labelledby="chat-heading" className="lg:col-span-5 scroll-mt-24">
              <Suspense fallback={<div className="h-[600px] bg-card rounded-2xl animate-pulse border border-border-subtle" />}>
                <ErrorBoundary>
                  <Chat />
                </ErrorBoundary>
              </Suspense>
            </section>

            {/* Map Section */}
            <section aria-labelledby="map-heading" className="lg:col-span-7 scroll-mt-24">
              {mounted ? (
                <Suspense fallback={<div className="h-[450px] bg-card rounded-2xl animate-pulse border border-border-subtle" />}>
                  <ErrorBoundary>
                    <LazyMap />
                  </ErrorBoundary>
                </Suspense>
              ) : (
                <div className="h-[450px] bg-card rounded-2xl border border-border-subtle" />
              )}
            </section>
          </div>

          {/* Videos Section */}
          <section aria-labelledby="videos-heading" className="scroll-mt-24">
            {mounted ? (
              <Suspense fallback={<div className="h-64 bg-card rounded-2xl animate-pulse border border-border-subtle" />}>
                <ErrorBoundary>
                  <LazyVideos />
                </ErrorBoundary>
              </Suspense>
            ) : (
              <div className="h-64 bg-card rounded-2xl border border-border-subtle" />
            )}
          </section>
        </div>

        <footer className="border-t border-border-subtle py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Civic Copilot &mdash; Official Guidelines Source
            </p>
            <div className="flex gap-8">
              <a href="https://eci.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-xs transition-colors font-medium uppercase tracking-widest">ECI Website</a>
              <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-xs transition-colors font-medium uppercase tracking-widest">Voter Portal</a>
            </div>
          </div>
        </footer>
      </main>
    </LanguageProvider>
  );
}