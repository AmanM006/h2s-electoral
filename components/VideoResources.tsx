import React from 'react';
import { env } from '@/lib/env';

/**
 * Interface for the YouTube API video response item.
 */
interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

/**
 * Fetches educational videos about the Indian Election Process from YouTube.
 * 
 * @returns A promise that resolves to an array of VideoItem objects.
 */
async function fetchVideos(): Promise<VideoItem[]> {
  if (!env.YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY is not set. Skipping video fetch.');
    return [];
  }

  try {
    const query = encodeURIComponent('Election Commission of India guide');
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${query}&type=video&key=${env.YOUTUBE_API_KEY}`;
    
    // next: { revalidate: 86400 } caches the results for 24 hours to save API quota.
    const res = await fetch(url, { next: { revalidate: 86400 } });
    
    if (!res.ok) {
      console.error('Failed to fetch YouTube videos:', await res.text());
      return [];
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

/**
 * Server Component that displays a grid of educational YouTube videos.
 * 
 * @returns The VideoResources component.
 */
export default async function VideoResources() {
  const videos = await fetchVideos();

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
