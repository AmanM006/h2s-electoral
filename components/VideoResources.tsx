"use client";

import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Loader2 } from 'lucide-react';

interface VideoItem {
  id: { videoId: string };
  snippet: { title: string };
}

export default function VideoResources() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!apiKey) {
        setLoading(false);
        return;
      }

      try {
        const query = encodeURIComponent('Election Commission of India official');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${query}&type=video&key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.items || []);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-48 bg-card rounded-2xl animate-pulse border border-border-subtle flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-800" size={24} />
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-[1px] bg-emerald-500" />
          <h2 id="videos-heading" className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">
            Resources
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Official Portals */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <a 
              href="https://eci.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-6 bg-card border border-border-subtle rounded-2xl hover:border-accent transition-all group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Official Website</span>
                <h3 className="text-lg font-bold text-white">ECI Main Portal</h3>
                <p className="text-xs text-gray-400">Election Commission of India</p>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-accent transition-colors" />
            </a>
            <a 
              href="https://voters.eci.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-6 bg-card border border-border-subtle rounded-2xl hover:border-emerald-500 transition-all group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Voter Services</span>
                <h3 className="text-lg font-bold text-white">Voter Portal</h3>
                <p className="text-xs text-gray-400">Registration & Voting Status</p>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
            </a>
          </div>

          {videos.map((video, index) => (
            <div 
              key={video.id.videoId} 
              className="group animate-fadeIn flex flex-col" 
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border-subtle group-hover:border-gray-500 transition-colors">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id.videoId}?modestbranding=1&rel=0`}
                  title={`YouTube video player: ${video.snippet.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 pointer-events-none border-[6px] border-black opacity-10" />
              </div>
              
              <div className="pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <Play size={10} fill="currentColor" /> Video
                  </span>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                <h3 className="text-sm font-bold text-gray-300 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                  {video.snippet.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}