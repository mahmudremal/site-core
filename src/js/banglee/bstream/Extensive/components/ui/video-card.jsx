import { useState } from 'react';
import { Link } from 'react-router-dom'; // Use 'react-router-dom' instead of 'react-router' for browser environment
import { Video } from '../../types';
import { formatViewCount, formatTimeAgo } from '../../lib/format';
import { cn } from '../../lib/utils';

export function VideoCard({ video, layout = 'grid' }) {
  const [isHovered, setIsHovered] = useState(false);
  const { id, title, thumbnail, channelName, channelAvatar, views, uploadedAt, duration } = video;

  return (
    <Link 
      to={`/watch/${id}`}
      className={cn(
        "group block transition-all",
        layout === 'grid' ? "w-full" : "flex gap-4 w-full"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Thumbnail */}
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-muted",
        layout === 'grid' ? "aspect-video w-full" : "aspect-video w-40 min-w-40 sm:w-60 sm:min-w-60"
      )}>
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
          {duration}
        </div>
      </div>

      {/* Video Info */}
      <div className={cn(
        "flex mt-3",
        layout === 'grid' ? "gap-3" : "flex-col gap-1"
      )}>
        {layout === 'grid' && (
          <div className="h-9 w-9 flex-shrink-0">
            <img
              src={channelAvatar}
              alt={channelName}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-grow">
          <h3 className={cn(
            "line-clamp-2 font-medium",
            layout === 'grid' ? "text-sm" : "text-base"
          )}>{title}</h3>
          
          <div className="mt-1 flex flex-col text-sm text-muted-foreground">
            <span className="hover:text-foreground">{channelName}</span>
            <div className="flex items-center">
              <span>{formatViewCount(views)} views</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(uploadedAt)}</span> {/* Use the formatTimeAgo to get the string for the timestamp */}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}