import React from 'react';
import { useChat } from '../contexts/ChatContext';
import Login from '../components/Login';
import Sidebar from '../components/sidebar/Sidebar';
import ChatView from '../components/chat/ChatView';
import ProfilePanel from '../components/common/ProfilePanel';
import GroupInfoPanel from '../components/chat/GroupInfoPanel';

const Home = () => {
    const { authState, showProfile, showGroupInfo } = useChat();

    if (authState !== 'AUTHENTICATED') {
        return <Login />;
    }

    return (
        <div className="xpo_flex xpo_h-screen xpo_font-sans">
            <Sidebar />
            <ChatView />
            {showProfile && <ProfilePanel />}
            {showGroupInfo && <GroupInfoPanel />}
        </div>
    );
};

export default Home;
