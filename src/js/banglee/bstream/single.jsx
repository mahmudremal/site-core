import React, { useEffect, useState } from 'react';
import VideoPlayer from './utils/VideoPlayer';
import { useParams } from 'react-router-dom';
import { home_route } from '@banglee/core';
import { strtotime } from '@functions';
import { sprintf } from 'sprintf-js';
import { __ } from '@js/utils';
import axios from 'axios';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const VideoPage = () => {
  const { id: video_id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    axios.get(`/bstream/api/videos/${video_id}`).then(res => setVideo(res.data));
    // axios.get(`/bstream/api/videos/${video_id}/related`).then(res => setRelated(res.data));
  }, [video_id]);

  if (!video) return <div className="xpo_p-4">Loading...</div>;

  return (
    <div className="xpo_w-full">
      <div className="xpo_m-auto xpo_flex xpo_flex-col xpo_gap-6 xpo_p-4">
        <div className="xpo_flex-1 xpo_space-y-4">
          <VideoPlayer video={video} />
          <h1 className="xpo_text-xl xpo_font-bold">{video.title}</h1>
          <div className="xpo_text-sm xpo_text-gray-500">{sprintf(__('%s views %s %s', 'site-core'), video.views, '•', strtotime(video.created_at).format('DD, MMM YY'))}</div>
          <div className="xpo_text-base xpo_text-gray-800">{video.description}</div>
        </div>
        <div className="xpo_w-full lg:xpo_w-80 xpo_space-y-4">
          {related.map((v, i) => (
            <div key={i} className="xpo_flex xpo_gap-4 xpo_cursor-pointer">
              <img src={v.thumbnail} className="xpo_w-32 xpo_h-20 xpo_object-cover xpo_rounded" alt={__('Video thumbnail', 'site-core')} />
              <div className="xpo_flex-1">
                <h2 className="xpo_text-sm xpo_font-semibold line-clamp-2">{v.title}</h2>
                <p className="xpo_text-xs xpo_text-gray-500">{sprintf(__('%s %s views', 'site-core'), v.channel, '•', v.views)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
