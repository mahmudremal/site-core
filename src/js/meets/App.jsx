import React, { useState } from 'react';
import Home from './Home';
import MeetingRoom from './MeetingRoom';

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');

  return joined ? (
    <MeetingRoom roomId={roomId} />
  ) : (
    <Home onJoin={(id) => { setRoomId(id); setJoined(true); }} />
  );
};

export default App;
