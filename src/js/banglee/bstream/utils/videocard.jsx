import React, { useState, useRef, useEffect } from 'react';
import { Play, Eye, Clock, MoreVertical, Bookmark, Share2 } from 'lucide-react';

const VideoCard = ({ video = {} }) => {
  const { 
    title = 'Untitled Video', 
    channel = 'Unknown Channel', 
    views = 0, 
    time = 'Just now', 
    thumbnail = null, 
    id: videoId = null,
    duration = null,
    video_url = null,
    channel_avatar = null,
    is_live = false
  } = video;

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    // Delay video preview to avoid flickering
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const formatViews = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${action} video:`, videoId);
    setShowMenu(false);
  };

  return (
    <div className="xpo_group xpo_relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          // In a real app, you would navigate using your routing solution
          // For now, this is just a placeholder
          console.log(`Navigate to video: ${videoId}`);
        }}
        className="xpo_block xpo_w-full xpo_max-w-sm xpo_bg-white dark:xpo_bg-gray-800 xpo_shadow-lg xpo_rounded-xl xpo_overflow-hidden xpo_transition-all xpo_duration-300 hover:xpo_shadow-xl hover:xpo_scale-105 xpo_cursor-pointer"
      >
        {/* Video Thumbnail/Preview Section */}
        <div className="xpo_relative xpo_w-full xpo_h-48 xpo_bg-gray-200 dark:xpo_bg-gray-700 xpo_overflow-hidden">
          {isHovered && video_url ? (
            <video
              ref={videoRef}
              src={video_url}
              className="xpo_w-full xpo_h-full xpo_object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <>
              {!imageError && thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt={title}
                  className="xpo_w-full xpo_h-full xpo_object-cover xpo_transition-transform xpo_duration-300 group-hover:xpo_scale-110"
                  onError={handleImageError}
                />
              ) : (
                <div className="xpo_w-full xpo_h-full xpo_bg-gradient-to-br xpo_from-gray-300 xpo_to-gray-400 dark:xpo_from-gray-600 dark:xpo_to-gray-700 xpo_flex xpo_items-center xpo_justify-center">
                  <Play className="xpo_w-12 xpo_h-12 xpo_text-gray-500 dark:xpo_text-gray-400" />
                </div>
              )}
            </>
          )}

          {/* Duration Badge */}
          {duration && (
            <div className="xpo_absolute xpo_bottom-2 xpo_right-2 xpo_bg-black xpo_bg-opacity-75 xpo_text-white xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded">
              {formatDuration(duration)}
            </div>
          )}

          {/* Live Badge */}
          {is_live && (
            <div className="xpo_absolute xpo_top-2 xpo_left-2 xpo_bg-red-600 xpo_text-white xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded xpo_flex xpo_items-center xpo_gap-1">
              <div className="xpo_w-2 xpo_h-2 xpo_bg-white xpo_rounded-full xpo_animate-pulse"></div>
              LIVE
            </div>
          )}

          {/* Hover Play Button */}
          {!isHovered && (
            <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-0 group-hover:xpo_bg-opacity-20 xpo_flex xpo_items-center xpo_justify-center xpo_transition-all xpo_duration-300">
              <Play className="xpo_w-12 xpo_h-12 xpo_text-white xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transform xpo_scale-75 group-hover:xpo_scale-100 xpo_transition-all xpo_duration-300" />
            </div>
          )}

          {/* Menu Button */}
          <button
            onClick={handleMenuClick}
            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_w-8 xpo_h-8 xpo_bg-black xpo_bg-opacity-50 hover:xpo_bg-opacity-75 xpo_text-white xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-all xpo_duration-300"
          >
            <MoreVertical className="xpo_w-4 xpo_h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="xpo_absolute xpo_top-10 xpo_right-2 xpo_bg-white dark:xpo_bg-gray-800 xpo_shadow-lg xpo_rounded-lg xpo_py-2 xpo_min-w-48 xpo_z-10 xpo_border dark:xpo_border-gray-700">
              <button
                onClick={(e) => handleMenuAction(e, 'save')}
                className="xpo_w-full xpo_px-4 xpo_py-2 xpo_text-left xpo_text-sm xpo_text-gray-700 dark:xpo_text-gray-300 hover:xpo_bg-gray-100 dark:hover:xpo_bg-gray-700 xpo_flex xpo_items-center xpo_gap-2"
              >
                <Bookmark className="xpo_w-4 xpo_h-4" />
                Save to playlist
              </button>
              <button
                onClick={(e) => handleMenuAction(e, 'share')}
                className="xpo_w-full xpo_px-4 xpo_py-2 xpo_text-left xpo_text-sm xpo_text-gray-700 dark:xpo_text-gray-300 hover:xpo_bg-gray-100 dark:hover:xpo_bg-gray-700 xpo_flex xpo_items-center xpo_gap-2"
              >
                <Share2 className="xpo_w-4 xpo_h-4" />
                Share
              </button>
            </div>
          )}
        </div>

        {/* Video Info Section */}
        <div className="xpo_p-4">
          {/* Channel Avatar and Title */}
          <div className="xpo_flex xpo_gap-3">
            <div className="xpo_flex-shrink-0">
              {channel_avatar ? (
                <img
                  src={channel_avatar}
                  alt={channel}
                  className="xpo_w-10 xpo_h-10 xpo_rounded-full xpo_object-cover"
                />
              ) : (
                <div className="xpo_w-10 xpo_h-10 xpo_rounded-full xpo_bg-gradient-to-br xpo_from-blue-400 xpo_to-purple-500 xpo_flex xpo_items-center xpo_justify-center xpo_text-white xpo_font-semibold xpo_text-sm">
                  {channel.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="xpo_flex-1 xpo_min-w-0">
              <h2 className="xpo_text-sm xpo_font-semibold xpo_text-gray-900 dark:xpo_text-white xpo_line-clamp-2 xpo_leading-5 xpo_mb-1">
                {title}
              </h2>
              
              <p className="xpo_text-sm xpo_text-gray-600 dark:xpo_text-gray-400 xpo_font-medium xpo_mb-1">
                {channel}
              </p>
              
              <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-xs xpo_text-gray-500 dark:xpo_text-gray-500">
                <span className="xpo_flex xpo_items-center xpo_gap-1">
                  <Eye className="xpo_w-3 xpo_h-3" />
                  {formatViews(views)}
                </span>
                <span>•</span>
                <span className="xpo_flex xpo_items-center xpo_gap-1">
                  <Clock className="xpo_w-3 xpo_h-3" />
                  {time}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;