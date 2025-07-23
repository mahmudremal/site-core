import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, Wifi, RefreshCw, ChevronUp } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const videoGrid = useRef(null);
  const abortController = useRef(null);

  const fetchVideos = useCallback(async (pageNum = page, reset = false) => {
    try {
      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get(`/bstream/videos?page=${pageNum}&limit=20`, {
        signal: abortController.current.signal
      });

      const newVideos = response.data;
      
      if (newVideos.length === 0) {
        setHasMore(false);
        return;
      }

      setVideos(prev => reset ? newVideos : [...prev, ...newVideos]);
      setError(null);
      
      // Check if we got fewer videos than requested (indicates last page)
      if (newVideos.length < 20) {
        setHasMore(false);
      }

    } catch (err) {
      if (err.name === 'AbortError') return; // Ignore aborted requests
      
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          'Failed to load videos';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  const hasScrolledToPageBottom = useCallback((threshold = 300) => {
    if (!videoGrid.current) return false;
    
    const rect = videoGrid.current.getBoundingClientRect();
    const elementBottom = rect.bottom;
    const viewportHeight = window.innerHeight;
    
    return elementBottom - viewportHeight <= threshold;
  }, []);

  const handleScroll = useCallback(() => {
    // Show/hide scroll to top button
    setShowScrollTop(window.pageYOffset > 1000);

    // Infinite scroll logic
    if (loadingMore || !hasMore || error) return;
    
    if (hasScrolledToPageBottom()) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore, error, hasScrolledToPageBottom]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleRetry = () => {
    setError(null);
    setPage(1);
    setHasMore(true);
    fetchVideos(1, true);
  };

  // Initial load
  useEffect(() => {
    fetchVideos(1, true);
  }, []);

  // Load more videos when page changes
  useEffect(() => {
    if (page > 1) {
      fetchVideos(page);
    }
  }, [page, fetchVideos]);

  // Scroll event listener
  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  // Memory management - keep only recent videos
  useEffect(() => {
    if (videos.length > 100) {
      setVideos(prev => prev.slice(-80)); // Keep last 80 videos
    }
  }, [videos.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Throttle utility function
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const LoadingSkeleton = () => (
    <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 lg:xpo_grid-cols-4 xl:xpo_grid-cols-5 xpo_gap-4">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="xpo_animate-pulse">
          <div className="xpo_bg-gray-300 xpo_rounded-lg xpo_aspect-video xpo_mb-3"></div>
          <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_mb-2"></div>
          <div className="xpo_h-3 xpo_bg-gray-300 xpo_rounded xpo_w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_py-12 xpo_px-4 xpo_text-center">
      <div className="xpo_bg-red-50 xpo_rounded-full xpo_p-3 xpo_mb-4">
        <AlertCircle className="xpo_w-8 xpo_h-8 xpo_text-red-500" />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">
        Oops! Something went wrong
      </h3>
      <p className="xpo_text-gray-600 xpo_mb-4 xpo_max-w-md">
        {error}
      </p>
      <button
        onClick={handleRetry}
        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-blue-700 xpo_transition-colors xpo_duration-200"
      >
        <RefreshCw className="xpo_w-4 xpo_h-4 xpo_mr-2" />
        Try Again
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_py-12 xpo_px-4 xpo_text-center">
      <div className="xpo_bg-gray-50 xpo_rounded-full xpo_p-3 xpo_mb-4">
        <Wifi className="xpo_w-8 xpo_h-8 xpo_text-gray-400" />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">
        No videos found
      </h3>
      <p className="xpo_text-gray-600">
        Check back later for new content!
      </p>
    </div>
  );

  return (
    <div className="xpo_w-full xpo_min-h-screen xpo_bg-gray-50">
      {/* <Sidebar> */}
        <div className="xpo_flex-1 xpo_p-4">
          {loading && videos.length === 0 ? (
            <LoadingSkeleton />
          ) : error && videos.length === 0 ? (
            <ErrorState />
          ) : videos.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div 
                ref={videoGrid} 
                className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 lg:xpo_grid-cols-4 xl:xpo_grid-cols-5 xpo_gap-4 xpo_mt-4"
              >
                {videos.map((video, index) => (
                  <VideoCard key={`${video.id}-${index}`} video={video} />
                ))}
              </div>

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="xpo_flex xpo_justify-center xpo_py-8">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_text-gray-600">
                    <RefreshCw className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
                    <span>Loading more videos...</span>
                  </div>
                </div>
              )}

              {/* End of content indicator */}
              {!hasMore && videos.length > 0 && (
                <div className="xpo_flex xpo_justify-center xpo_py-8">
                  <div className="xpo_text-gray-500 xpo_text-sm">
                    You've reached the end! 🎉
                  </div>
                </div>
              )}

              {/* Error state for pagination */}
              {error && videos.length > 0 && (
                <div className="xpo_flex xpo_justify-center xpo_py-8">
                  <div className="xpo_bg-red-50 xpo_border xpo_border-red-200 xpo_rounded-lg xpo_p-4 xpo_flex xpo_items-center xpo_space-x-3">
                    <AlertCircle className="xpo_w-5 xpo_h-5 xpo_text-red-500 xpo_flex-shrink-0" />
                    <div className="xpo_flex-1">
                      <p className="xpo_text-sm xpo_text-red-800">Failed to load more videos</p>
                      <p className="xpo_text-xs xpo_text-red-600">{error}</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="xpo_text-red-600 xpo_hover:text-red-800 xpo_text-sm xpo_font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      {/* </Sidebar> */}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="xpo_fixed xpo_bottom-6 xpo_right-6 xpo_bg-blue-600 xpo_text-white xpo_rounded-full xpo_p-3 xpo_shadow-lg xpo_hover:bg-blue-700 xpo_transition-all xpo_duration-200 xpo_transform xpo_hover:scale-110 xpo_z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="xpo_w-5 xpo_h-5" />
        </button>
      )}
    </div>
  );
};

export default Home;