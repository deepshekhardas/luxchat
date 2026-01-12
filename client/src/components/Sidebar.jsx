import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Plus, Search, LogOut, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateGroupModal from './CreateGroupModal';

const Sidebar = ({ activeChat, setActiveChat }) => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, [activeChat]); // Refresh when chat changes (e.g. new message)

    useEffect(() => {
        if (socket) {
            socket.on('message.receive', () => {
                // Simple strategy: reload conversations to update last message/unread
                fetchConversations();
            });
        }
        return () => socket?.off('message.receive');
    }, [socket]);

    const fetchConversations = async () => {
        try {
            const [convRes, groupRes] = await Promise.all([
                api.get('/conversations'),
                api.get('/groups')
            ]);

            const convs = convRes.data.data.map(c => ({ ...c, isGroup: false }));
            const groups = groupRes.data.data.map(g => ({ ...g, isGroup: true }));

            // Merge and Sort by latest activity
            const allChats = [...groups, ...convs].sort((a, b) => {
                const dateA = new Date(a.last_message?.createdAt || a.updatedAt);
                const dateB = new Date(b.last_message?.createdAt || b.updatedAt);
                return dateB - dateA;
            });

            setConversations(allChats);
        } catch (error) {
            console.error('Failed to fetch chats', error);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const { data } = await api.get(`/users?search=${query}`);
                setSearchResults(data.data);
            } catch {
                console.error('User search failed');
            }
        } else {
            setSearchResults([]);
        }
    };

    const startConversation = async (targetUser) => {
        try {
            const { data } = await api.post('/conversations', { userId: targetUser._id });
            const newConv = data.data;

            // Check if already in list
            if (!conversations.find(c => c._id === newConv._id)) {
                setConversations([newConv, ...conversations]);
            }

            setActiveChat(newConv);
            setShowSearch(false);
            setSearchQuery('');
        } catch {
            toast.error('Failed to start chat');
        }
    };

    const getPartner = (participants) => {
        if (!participants) return {};
        return participants.find(p => p._id !== user._id) || {};
    };

    return (
        <div className="w-80 h-full flex flex-col glass-panel border-r-0 rounded-l-2xl my-4 ml-4">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                        {user.name[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-white tracking-wide">{user.name}</span>
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Search Toggle / Bar */}
            <div className="p-4">
                {showSearch ? (
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Find people..."
                            className="w-full glass-input p-2.5 pl-9 rounded-xl text-sm"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <button
                            onClick={() => setShowSearch(false)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                            x
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-blue-300 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-sm font-medium">New Chat</span>
                        </button>
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="px-3 bg-white/5 hover:bg-white/10 border border-white/5 text-purple-300 rounded-xl flex items-center justify-center transition-all"
                            title="Create Group"
                        >
                            <Users size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {showSearch && searchResults.length > 0 && (
                <div className="px-4 pb-4 overflow-y-auto max-h-40 border-b border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Search Results</p>
                    {searchResults.map(u => (
                        <div
                            key={u._id}
                            onClick={() => startConversation(u)}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer text-gray-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                {u.name[0]}
                            </div>
                            <span>{u.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
                {conversations.map(conv => {
                    const partner = getPartner(conv.participants);
                    const isGroup = conv.isGroup;
                    const displayName = isGroup ? conv.name : partner.name || 'Unknown User';
                    const isActive = activeChat?._id === conv._id;

                    return (
                        <div
                            key={conv._id}
                            onClick={() => setActiveChat(conv)}
                            className={`p-3 flex items-center space-x-3 cursor-pointer rounded-xl transition-all duration-200 border border-transparent 
                            ${isActive
                                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-white/10 shadow-lg'
                                    : 'hover:bg-white/5 hover:border-white/5'
                                }`}
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden shadow-inner
                                    ${isGroup ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-700/50 text-gray-300'}`}>
                                    {displayName[0]}
                                </div>
                                {partner.status === 'online' && !isGroup && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a40] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                        {displayName}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-xs truncate">
                                    {conv.last_message?.text || 'Start a conversation'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showGroupModal && (
                <CreateGroupModal
                    onClose={() => setShowGroupModal(false)}
                    onGroupCreated={(newGroup) => {
                        const groupWithFlag = { ...newGroup, isGroup: true };
                        setConversations([groupWithFlag, ...conversations]);
                        setActiveChat(groupWithFlag);
                    }}
                />
            )}
        </div>
    );
};

export default Sidebar;
