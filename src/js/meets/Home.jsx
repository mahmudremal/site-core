import React, { useState } from 'react';
import meetBanner from '@img/meet-banner.png';
import { __ } from '@js/utils';

const Home = ({ onJoin }) => {
  const [input, setInput] = useState('');

  const handleJoin = () => {
    if (!input) return alert('Enter a room ID');
    onJoin(input);
  };

  const createNewMeeting = () => {
    const newId = Math.random().toString(36).substring(2, 10);
    onJoin(newId);
  };

  return (
    <div className="xpo_flex xpo_min-h-screen xpo_items-center xpo_justify-between xpo_p-10 xpo_bg-white">
      <div className="xpo_max-w-lg">
        <h1 className="xpo_text-4xl xpo_font-bold xpo_mb-4">Video calls and meetings for everyone</h1>
        <p className="xpo_text-gray-600 xpo_mb-8">Connect, collaborate and celebrate from anywhere with Google Meet</p>
        <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-2">
          <button
            onClick={createNewMeeting}
            className="xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-full"
          >New meeting</button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a code or link"
            className="xpo_px-4 xpo_py-2 xpo_rounded-full xpo_border xpo_flex-1"
          />
          <button onClick={handleJoin} className="xpo_text-gray-700">Join</button>
        </div>
        <p className="xpo_text-xs xpo_text-gray-500">{__('Learn more about Google Meet')}</p>
      </div>
      <div className="xpo_hidden lg:xpo_block">
        <img src={meetBanner} alt={__('Meet banner')} className="xpo_max-w-md" />
      </div>
    </div>
  );
};

export default Home;
