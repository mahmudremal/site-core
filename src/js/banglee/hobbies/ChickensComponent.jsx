import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Wifi, Video } from 'lucide-react';

const ChickensComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="xpo_min-h-screen xpo_flex xpo_items-center xpo_justify-center xpo_bg-gradient-to-br xpo_from-purple-600 xpo_via-pink-500 xpo_to-orange-400 xpo_p-6">
      <div className="xpo_bg-white xpo_rounded-3xl xpo_shadow-2xl xpo_p-10 xpo_text-center xpo_max-w-lg xpo_w-full">
        <div className="xpo_flex xpo_flex-col xpo_items-center xpo_gap-4 xpo_mb-10">
          <Video className="xpo_w-14 xpo_h-14 xpo_text-pink-600" />
          <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-800">
            Chicken Farm Streaming
          </h1>
          <p className="xpo_text-gray-500">
            Select a mode to start streaming or receiving live video.
          </p>
        </div>

        <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-6">
          <button
            onClick={() => navigate('/chickens/receiver')}
            className="xpo_flex-1 xpo_py-4 xpo_px-6 xpo_bg-gradient-to-r xpo_from-green-500 xpo_to-emerald-600 xpo_text-white xpo_rounded-xl xpo_font-semibold xpo_text-lg xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_scale-105 hover:xpo_shadow-lg xpo_transition-all"
          >
            <Wifi className="xpo_w-5 xpo_h-5" />
            Receiver
          </button>

          <button
            onClick={() => navigate('/chickens/broadcaster')}
            className="xpo_flex-1 xpo_py-4 xpo_px-6 xpo_bg-gradient-to-r xpo_from-purple-600 xpo_to-pink-600 xpo_text-white xpo_rounded-xl xpo_font-semibold xpo_text-lg xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_scale-105 hover:xpo_shadow-lg xpo_transition-all"
          >
            <Radio className="xpo_w-5 xpo_h-5" />
            Broadcaster
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChickensComponent;
