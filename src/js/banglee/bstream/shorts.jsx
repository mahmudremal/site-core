import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { __ } from '@js/utils';

const ReelsScreen = ({ videoId, onBack }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/bstream/videos/${videoId}`);
      setVideo(response.data);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          __('Failed to load video', 'site-core');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  const handleVideoClick = useCallback(() => {
    togglePlay();
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [togglePlay]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId, fetchVideo]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [handleTimeUpdate, handleLoadedMetadata]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const LoadingState = () => (
    <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-full">
      <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-white"></div>
    </div>
  );

  const ErrorState = () => (
    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_h-full xpo_text-center xpo_px-4">
      <div className="xpo_bg-red-500 xpo_bg-opacity-20 xpo_rounded-full xpo_p-3 xpo_mb-4">
        <AlertCircle className="xpo_w-8 xpo_h-8 xpo_text-red-400" />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-white xpo_mb-2">
        {__('Video not available', 'site-core')}
      </h3>
      <p className="xpo_text-gray-300 xpo_mb-4">
        {error}
      </p>
      <button
        onClick={() => fetchVideo()}
        className="xpo_px-4 xpo_py-2 xpo_bg-white xpo_text-black xpo_rounded-lg xpo_hover:bg-gray-200 xpo_transition-colors"
      >
        {__('Try Again', 'site-core')}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_z-50">
        <LoadingState />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_z-50">
        <button
          onClick={onBack}
          className="xpo_absolute xpo_top-4 xpo_left-4 xpo_z-10 xpo_p-2 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full xpo_text-white xpo_hover:bg-opacity-70"
        >
          <ArrowLeft className="xpo_w-6 xpo_h-6" />
        </button>
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_z-50 xpo_flex xpo_items-center xpo_justify-center">
      <div className="xpo_relative xpo_w-full xpo_h-full xpo_max-w-sm xpo_mx-auto">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="xpo_absolute xpo_top-4 xpo_left-4 xpo_z-10 xpo_p-2 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full xpo_text-white xpo_hover:bg-opacity-70"
        >
          <ArrowLeft className="xpo_w-6 xpo_h-6" />
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          src={video.url}
          className="xpo_w-full xpo_h-full xpo_object-cover"
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={handleVideoClick}
        />

        {/* Play/Pause Overlay */}
        {showControls && (
          <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center xpo_pointer-events-none">
            <div className="xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full xpo_p-4">
              {isPlaying ? (
                <Pause className="xpo_w-12 xpo_h-12 xpo_text-white" />
              ) : (
                <Play className="xpo_w-12 xpo_h-12 xpo_text-white" />
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_right-0 xpo_p-4">
          <div className="xpo_w-full xpo_bg-gray-600 xpo_bg-opacity-50 xpo_rounded-full xpo_h-1">
            <div 
              className="xpo_bg-white xpo_h-1 xpo_rounded-full xpo_transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Side Actions */}
        <div className="xpo_absolute xpo_right-4 xpo_bottom-20 xpo_flex xpo_flex-col xpo_space-y-6">
          
          {/* Like Button */}
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_space-y-1">
            <button
              onClick={toggleLike}
              className={`xpo_p-3 xpo_rounded-full xpo_transition-colors ${
                isLiked ? 'xpo_bg-red-500' : 'xpo_bg-black xpo_bg-opacity-50'
              }`}
            >
              <Heart className={`xpo_w-6 xpo_h-6 ${isLiked ? 'xpo_text-white xpo_fill-current' : 'xpo_text-white'}`} />
            </button>
            <span className="xpo_text-white xpo_text-xs xpo_font-medium">
              {video.likes || 0}
            </span>
          </div>

          {/* Comment Button */}
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_space-y-1">
            <button className="xpo_p-3 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full">
              <MessageCircle className="xpo_w-6 xpo_h-6 xpo_text-white" />
            </button>
            <span className="xpo_text-white xpo_text-xs xpo_font-medium">
              {video.comments || 0}
            </span>
          </div>

          {/* Share Button */}
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_space-y-1">
            <button className="xpo_p-3 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full">
              <Share className="xpo_w-6 xpo_h-6 xpo_text-white" />
            </button>
            <span className="xpo_text-white xpo_text-xs xpo_font-medium">
              {__('Share', 'site-core')}
            </span>
          </div>

          {/* More Options */}
          <button className="xpo_p-3 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full">
            <MoreHorizontal className="xpo_w-6 xpo_h-6 xpo_text-white" />
          </button>

        </div>

        {/* Volume Control */}
        <button
          onClick={toggleMute}
          className="xpo_absolute xpo_top-4 xpo_right-4 xpo_z-10 xpo_p-2 xpo_bg-black xpo_bg-opacity-50 xpo_rounded-full xpo_text-white xpo_hover:bg-opacity-70"
        >
          {isMuted ? (
            <VolumeX className="xpo_w-6 xpo_h-6" />
          ) : (
            <Volume2 className="xpo_w-6 xpo_h-6" />
          )}
        </button>

        {/* Video Info */}
        <div className="xpo_absolute xpo_bottom-4 xpo_left-4 xpo_right-20">
          <div className="xpo_text-white">
            <h3 className="xpo_font-semibold xpo_mb-1 xpo_line-clamp-2">
              {video.title}
            </h3>
            <p className="xpo_text-sm xpo_text-gray-300 xpo_mb-2">
              @{video.channel || video.author}
            </p>
            {video.description && (
              <p className="xpo_text-sm xpo_text-gray-300 xpo_line-clamp-2">
                {video.description}
              </p>
            )}
            <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mt-2 xpo_text-xs xpo_text-gray-400">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <span>•</span>
              <span>{video.views || 0} {__('views', 'site-core')}</span>
            </div>
          </div>
        </div>

        {/* Navigation Hints */}
        <div className="xpo_absolute xpo_right-2 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_flex xpo_flex-col xpo_space-y-2">
          <button className="xpo_p-1 xpo_bg-black xpo_bg-opacity-30 xpo_rounded-full">
            <ChevronUp className="xpo_w-4 xpo_h-4 xpo_text-white" />
          </button>
          <button className="xpo_p-1 xpo_bg-black xpo_bg-opacity-30 xpo_rounded-full">
            <ChevronDown className="xpo_w-4 xpo_h-4 xpo_text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReelsScreen;