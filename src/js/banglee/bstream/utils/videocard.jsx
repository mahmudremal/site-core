import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { home_route } from '@banglee/core';

const VideoCard = ({ video = {} }) => {
  const { title = null, channel = null, views = null, time = null, thumbnail = null, id: videoId = null } = video;
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = React.createRef();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Link
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      to={home_route('bstream', `/watch/${videoId}`)}
      className="xpo_w-full xpo_max-w-sm xpo_bg-white xpo_shadow-md xpo_rounded-lg xpo_overflow-hidden xpo_cursor-pointer"
    >
      {isHovered ? (
        <>
          <video
            ref={videoRef}
            src={`https://storage.googleapis.com/gtv-videos-bucket/sample/${videoId}.mp4`} // Replace with actual video URL or keep dynamic
            className="xpo_w-full xpo_h-48 xpo_object-cover"
            muted
            autoPlay
            loop
          />
        </>
      ) : (
        <img src={thumbnail} alt={title} className="xpo_w-full xpo_h-48 xpo_object-cover" />
      )}
      <div className="xpo_p-4">
        <h2 className="xpo_text-md xpo_font-semibold">{title}</h2>
        <p className="xpo_text-gray-600">{channel}</p>
        <p className="xpo_text-gray-500 xpo_text-sm">
          {views} • {time}
        </p>
      </div>
    </Link>
  );
};

export default VideoCard;