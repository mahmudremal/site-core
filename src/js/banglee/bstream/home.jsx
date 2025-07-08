import React, { useEffect, useState, useRef, useCallback } from 'react';
import VideoCard from './utils/videocard';
import Sidebar from './utils/sidebar';
import axios from 'axios';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const videoGrid = useRef(null);

  const fetchVideos = async () => {
    // setLoading(true);
    axios.get(`/bstream/videos?page=${page}`)
    .then(res => res.data)
    .then(list => setVideos(prev => [...prev, ...list]))
    .catch(err => setError(err?.response?.data?.message??err?.message))
    .finally(() => setLoading(false))
  };
  
  useEffect(() => {
    fetchVideos();
  }, []);
  

  const hasScrolledToPageBottom = (threshold = 0) => {
    if (!videoGrid.current) return false;
    const cReact = videoGrid.current.getBoundingClientRect();
    const pageHeight = cReact.height + cReact.top;
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.pageYOffset;
    if (pageHeight <= viewportHeight) return false;
    const distanceToBottom = pageHeight - (viewportHeight + scrollPosition);
    return distanceToBottom <= threshold;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      if (!hasScrolledToPageBottom(300)) return;
      console.log('going to change page');
      setLoading(true);
      setPage(prev => prev + 1);
    };
    // 
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (page <= 1) {return;}
    fetchVideos();
  }, [page]);

  useEffect(() => {
    if (videos.length <= 50) {return;}
    setVideos(prev => prev.slice(prev.length - 50));
  }, [videos]);

  return (
    <div className="xpo_w-full">
      <Sidebar>
        <div className="xpo_flex-1 xpo_p-4">
          <div ref={videoGrid} className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 lg:xpo_grid-cols-4 xl:xpo_grid-cols-5 xpo_gap-4 xpo_mt-4">
            {videos.map((video, index) => <VideoCard key={index} video={video} />)}
          </div>
        </div>
      </Sidebar>
      {loading && <p>Loading more videos...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Home;