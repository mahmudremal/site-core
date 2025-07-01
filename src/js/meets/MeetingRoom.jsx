import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";

const MeetingRoom = ({ roomId }) => {
  const [peer, setPeer] = useState(null);
  const [streams, setStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const localVideoRef = useRef();

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);

      const peerInstance = new Peer(undefined, {
        host: window.location.hostname,
        port: 3000,
        path: '/peerjs',
      });

      setPeer(peerInstance);

      peerInstance.on('open', id => {
        if (roomId !== id) {
          const call = peerInstance.call(roomId, stream);
          call.on('stream', remoteStream => addStream(call.peer, remoteStream));
        }
      });

      peerInstance.on('call', call => {
        call.answer(stream);
        call.on('stream', remoteStream => addStream(call.peer, remoteStream));
      });
    };

    init();
  }, []);

  const addStream = (peerId, stream) => {
    setStreams(prev => {
      if (prev.find(s => s.peerId === peerId)) return prev;
      return [...prev, { peerId, stream }];
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(prev => !prev);
    }
  };

  const leaveMeeting = () => {
    localStream.getTracks().forEach(track => track.stop());
    peer.disconnect();
    window.location.reload();
  };

  return (
    <div className="xpo_bg-gradient-to-br xpo_from-[#0f172a] xpo_to-[#1e293b] xpo_min-h-screen xpo_text-white xpo_relative">
      {/* Video Grid */}
      <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_p-8">
        <video ref={localVideoRef} autoPlay muted playsInline className="xpo_rounded-xl xpo_shadow-lg" />
        {streams.map(({ peerId, stream }) => (
          <VideoComponent key={peerId} stream={stream} />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="xpo_fixed xpo_bottom-4 xpo_left-0 xpo_right-0 xpo_flex xpo_justify-center xpo_space-x-4">
        <button onClick={leaveMeeting} className="xpo_bg-red-600 xpo_p-3 xpo_rounded-full xpo_text-white"><PhoneOff /></button>
        <button onClick={toggleAudio} className="xpo_bg-gray-700 xpo_p-3 xpo_rounded-full xpo_text-white">{audioEnabled ? <Mic /> : <MicOff />}</button>
        <button onClick={toggleVideo} className="xpo_bg-gray-700 xpo_p-3 xpo_rounded-full xpo_text-white">{videoEnabled ? <Video /> : <VideoOff />}</button>
        <button className="xpo_bg-gray-700 xpo_p-3 xpo_rounded-full xpo_text-white"><Users /></button>
      </div>

      {/* Link Share Popup */}
      <div className="xpo_absolute xpo_bottom-20 xpo_left-8 xpo_bg-white xpo_text-black xpo_p-4 xpo_rounded-lg xpo_shadow-xl">
        <p className="xpo_font-semibold">Your meeting's ready</p>
        <input
          value={`https://yourapp.com/meet/${roomId}`}
          readOnly
          className="xpo_mt-2 xpo_p-2 xpo_border xpo_rounded w-full"
        />
        <p className="xpo_text-xs xpo_text-gray-500 xpo_mt-2">People need your permission to join</p>
      </div>
    </div>
  );
};

const VideoComponent = ({ stream }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="xpo_rounded-xl xpo_shadow" />;
};

export default MeetingRoom;
