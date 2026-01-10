import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
    const [activeChat, setActiveChat] = useState(null);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
            <ChatWindow activeChat={activeChat} />
        </div>
    );
};

export default Chat;
