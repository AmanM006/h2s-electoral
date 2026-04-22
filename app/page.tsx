import Timeline from '@/components/Timeline';
import Map from '@/components/Map';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 font-[family-name:var(--font-geist-sans)] selection:bg-indigo-500/30">
      <div className="bg-gradient-to-b from-indigo-900/50 to-gray-900 border-b border-gray-800">
        <header className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 tracking-tight mb-4">
            Civic Copilot
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
            Your interactive guide to the Indian Election Process. Explore the timeline, find your polling station, and ask questions.
          </p>
        </header>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-24">
        {/* Timeline Section */}
        <section aria-labelledby="timeline-section" className="scroll-mt-16">
          <Timeline />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Chat Section */}
          <section aria-labelledby="chat-section" className="scroll-mt-16">
            <Chat />
          </section>

          {/* Map Section */}
          <section aria-labelledby="map-section" className="scroll-mt-16">
            <Map />
          </section>
        </div>
      </div>

      <footer className="bg-gray-950 border-t border-gray-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Civic Copilot. Based on Election Commission of India guidelines.
          </p>
        </div>
      </footer>
    </main>
  );
}
