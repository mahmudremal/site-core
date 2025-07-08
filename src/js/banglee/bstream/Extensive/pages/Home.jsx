import { useState } from 'react';
import { VideoCard } from '../components/ui/video-card';
import { CategoryBar } from '../components/ui/category-bar';
import { videos, videoCategories } from '../data/videos';
import { cn } from '../lib/utils';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 pt-4 pb-8 max-w-screen-2xl">
      <CategoryBar
        categories={videoCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        className="mb-6 -ml-4 -mr-4"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredVideos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-medium mb-2">No videos found in this category</p>
          <p className="text-muted-foreground mb-4">Try selecting a different category or check back later</p>
        </div>
      )}
    </div>
  );
}