import { useEffect, useState } from 'react';
import { VideoCard } from '../components/ui/video-card';
import { videos } from '../data/videos';
import { Flame, Music2, GamepadIcon, Newspaper, Trophy, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryVideos, setCategoryVideos] = useState([]);

  const categories = [
    { 
      id: 'trending', 
      title: 'Trending', 
      description: "See what's trending on YouTube right now",
      icon: <Flame className="h-6 w-6" />,
      color: 'bg-red-100 text-red-500'
    },
    { 
      id: 'music', 
      title: 'Music', 
      description: 'Check out the latest music videos and hits',
      icon: <Music2 className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-500'
    },
    { 
      id: 'gaming', 
      title: 'Gaming', 
      description: 'Explore gaming videos, live streams, and more',
      icon: <GamepadIcon className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-500'
    },
    { 
      id: 'news', 
      title: 'News', 
      description: 'Stay up to date with the latest news',
      icon: <Newspaper className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-700'
    },
    { 
      id: 'sports', 
      title: 'Sports', 
      description: 'Catch up on highlights, replays, and sports news',
      icon: <Trophy className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'learning', 
      title: 'Learning', 
      description: 'Expand your knowledge with educational content',
      icon: <Lightbulb className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-500'
    },
  ];

  // Filter videos based on selected category
  useEffect(() => {
    if (selectedCategory) {
      // Simulate fetching category-specific videos
      setCategoryVideos(
        videos.filter((_, index) => {
          return index % categories.length === categories.findIndex(c => c.id === selectedCategory);
        })
      );
    } else {
      // Return trending videos by default (most viewed)
      setCategoryVideos(
        [...videos].sort((a, b) => b.views - a.views).slice(0, 8)
      );
    }
  }, [selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        <p className="text-muted-foreground mb-6">
          Discover videos from across YouTube
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex items-center p-4 rounded-xl border transition-all hover:shadow-md",
                selectedCategory === category.id ? "border-black ring-2 ring-black ring-opacity-10" : "border-border"
              )}
            >
              <div className={cn(
                "mr-4 rounded-full p-3",
                category.color
              )}>
                {category.icon}
              </div>
              <div className="text-left">
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-6">
          {selectedCategory 
            ? `${categories.find(c => c.id === selectedCategory)?.title} videos` 
            : 'Trending videos'
          }
        </h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categoryVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}