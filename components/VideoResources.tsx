"use client";

import React, { useState, useEffect } from 'react';

interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
}

export default function VideoResources() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      // By using process.env.NEXT_PUBLIC_, we allow the browser to see the key
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

      if (!apiKey) {
        console.warn('YOUTUBE_API_KEY is not set. Skipping video fetch.');
        setLoading(false);
        return;
      }

      try {
        const query = encodeURIComponent('Election Commission of India guide');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${query}&type=video&key=${apiKey}`;
        
        const res = await fetch(url);
        
        if (!res.ok) {
          console.error('Failed to fetch YouTube videos');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setVideos(data.items || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse flex items-center justify-center mt-8">
        <span className="text-gray-400">Loading Educational Videos...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="videos-heading" className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="videos-heading" className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-md">
          Educational Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id.videoId} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id.videoId}`}
                  title={video.snippet.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  aria-label={`YouTube video: ${video.snippet.title}`}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-2" title={video.snippet.title}>
                  {video.snippet.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}