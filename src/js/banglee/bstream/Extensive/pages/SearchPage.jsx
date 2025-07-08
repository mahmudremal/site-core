import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { VideoCard } from '../components/ui/video-card';
import { videos } from '../data/videos';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = videos.filter((video) => {
          const titleMatch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
          const descriptionMatch = video.description?.toLowerCase().includes(searchQuery.toLowerCase());
          const channelMatch = video.channelName.toLowerCase().includes(searchQuery.toLowerCase());
          return titleMatch || descriptionMatch || channelMatch;
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 border-4 border-t-black border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Searching...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-medium">Search results for "{searchQuery}"</h1>
            <p className="text-muted-foreground">{searchResults.length} results found</p>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-6">
              {searchResults.map(video => (
                <VideoCard key={video.id} video={video} layout="row" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No videos found</h2>
              <p className="text-muted-foreground max-w-md">
                Try different keywords or check the spelling of your search query
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}