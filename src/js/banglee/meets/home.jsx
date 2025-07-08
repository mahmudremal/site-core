import React, { useState } from 'react';
import meetBanner from '@img/meet-banner.png';
import { useNavigate } from 'react-router-dom';
import { __ } from '@js/utils';
import { Loader } from 'lucide-react';
import { sleep } from '@functions';
import { NavMenu, home_route } from '@banglee/core';

export default function MeetingHome() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [joining, setJoining] = useState(null);
  const [creating, setCreating] = useState(null);

  return (
    <div className="xpo_min-h-screen">
      <NavMenu />
      <div className="xpo_bg-white xpo_flex xpo_flex-col lg:xpo_flex-row xpo_items-center xpo_justify-between xpo_px-6 xpo_py-16 lg:xpo_px-20">
        <div className="xpo_max-w-xl xpo_text-center lg:xpo_text-left">
          <h1 className="xpo_text-4xl lg:xpo_text-5xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">
            {__('Video calls and meetings for everyone')}
          </h1>
          <p className="xpo_text-gray-600 xpo_text-lg xpo_mb-8">
            {__('Connect, collaborate and celebrate from anywhere with Banglee Meet')}
          </p>

          <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_items-stretch xpo_gap-3 xpo_mb-3">
            <button
              onClick={e => {
                sleep(100)
                .then(() => setCreating(true))
                .then(async () => await sleep(3000))
                .then(() => Math.random().toString(36).substring(2, 10))
                .then(roomId => navigate(home_route('meets', roomId)))
                .catch(err => alert(err?.response?.data?.message??err?.message))
                .finally(() => setCreating(false))
              }}
              className="xpo_flex xpo_gap-3 xpo_items-center xpo_justify-center xpo_bg-blue-600 hover:xpo_bg-blue-700 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-full xpo_text-sm xpo_font-medium"
            >
              {creating ? <Loader className="xpo_animate-spin" /> : null} {__('New meeting')}
            </button>

            <input
              type="text"
              value={roomId}
              placeholder={__('Enter a code or link')}
              onChange={(e) => setRoomId(e.target.value)}
              className="xpo_flex-1 xpo_px-4 xpo_py-3 xpo_rounded-full xpo_border xpo_border-gray-300 focus:xpo_border-blue-500 xpo_text-sm"
            />

            <button
              disabled={joining}
              onClick={e => {
                sleep(100)
                .then(() => setJoining(true))
                .then(() => {
                  if (!roomId.trim()) {
                    throw new Error(__('Enter a room ID'))
                  }
                  return true;
                })
                .then(async () => await sleep(3000))
                .then(() => navigate(home_route('meets', roomId)))
                .catch(err => alert(err?.response?.data?.message??err?.message))
                .finally(() => setJoining(false))
              }}
              className="xpo_flex xpo_gap-3 xpo_items-center xpo_justify-center xpo_text-gray-700 hover:xpo_text-blue-600 xpo_px-4 xpo_py-3 xpo_text-sm xpo_font-medium"
            >{joining ? <Loader className="xpo_animate-spin" /> : null} {__('Join')}</button>
          </div>

          <p className="xpo_text-xs xpo_text-gray-500">
            {__('Learn more about Banglee Meet')}
          </p>
        </div>
        <div className="xpo_hidden lg:xpo_block xpo_mt-12 lg:xpo_mt-0">
          <img
            src={meetBanner}
            alt={__('Meet banner')}
            className="xpo_max-w-md xpo_w-full"
          />
        </div>
      </div>
    </div>
  );
}
