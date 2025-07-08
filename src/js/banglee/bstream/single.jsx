import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './utils/sidebar';
import axios from 'axios';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const video = videoRef.current;
    if (playing) video.pause();
    else video.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleProgress = (e) => {
    const video = videoRef.current;
    const percent = e.target.value;
    video.currentTime = (percent / 100) * video.duration;
    setProgress(percent);
  };

  useEffect(() => {
    const video = videoRef.current;
    const update = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };
    const setDur = () => setDuration(video.duration);
    video.addEventListener('timeupdate', update);
    video.addEventListener('loadedmetadata', setDur);
    return () => {
      video.removeEventListener('timeupdate', update);
      video.removeEventListener('loadedmetadata', setDur);
    };
  }, []);

  return (
    <div className="xpo_w-full xpo_bg-black xpo_relative xpo_rounded-xl xpo_overflow-hidden">
      <video ref={videoRef} src={src} poster={poster} className="xpo_w-full xpo_aspect-video" muted={muted} />
      <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_right-0 xpo_p-4 xpo_bg-gradient-to-t xpo_from-black/80 xpo_to-transparent xpo_flex xpo_items-center xpo_gap-4 xpo_text-white">
        <button onClick={togglePlay}>{playing ? <Pause /> : <Play />}</button>
        <button onClick={toggleMute}>{muted ? <VolumeX /> : <Volume2 />}</button>
        <input type="range" value={progress} onChange={handleProgress} className="xpo_flex-1" />
        <div className="xpo_text-white xpo_text-sm">{formatTime((progress / 100) * duration)} / {formatTime(duration)}</div>
        <button onClick={() => videoRef.current.requestFullscreen()}><Maximize /></button>
      </div>
    </div>
  );
};

const VideoPage = () => {
  const { id: video_id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    axios.get(`/bstream/videos/${video_id}`).then(res => setVideo(res.data));
    // axios.get(`/video/${video_id}/related`).then(res => setRelated(res.data));
  }, [video_id]);

  if (!video) return <div className="xpo_p-4">Loading...</div>;

  return (
    <div className="xpo_w-full">
        <Sidebar>
            <div className="xpo_m-auto xpo_flex xpo_flex-col xpo_gap-6 xpo_p-4">
            <div className="xpo_flex-1 xpo_space-y-4">
                <VideoPlayer src={video.url} poster={video.poster} />
                <h1 className="xpo_text-xl xpo_font-bold">{video.title}</h1>
                <div className="xpo_text-sm xpo_text-gray-500">{video.views} views • {video.uploaded}</div>
                <div className="xpo_text-base xpo_text-gray-800">{video.description}</div>
            </div>
            <div className="xpo_w-full lg:xpo_w-80 xpo_space-y-4">
                {related.map((v, i) => (
                <div key={i} className="xpo_flex xpo_gap-4 xpo_cursor-pointer">
                    <img src={v.thumbnail} className="xpo_w-32 xpo_h-20 xpo_object-cover xpo_rounded" alt="Video thumbnail" />
                    <div className="xpo_flex-1">
                    <h2 className="xpo_text-sm xpo_font-semibold line-clamp-2">{v.title}</h2>
                    <p className="xpo_text-xs xpo_text-gray-500">{v.channel} • {v.views} views</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </Sidebar>
    </div>
  );
};

export default VideoPage;
