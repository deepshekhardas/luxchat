import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, Paperclip, X, MessageSquare } from 'lucide-react';
import moment from 'moment';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ activeChat }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false); // Emoji State
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [typingUser, setTypingUser] = useState(null);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Quick sound URL

    useEffect(() => {
        if (activeChat) {
            fetchMessages();
            // Join Room
            socket?.emit('join', [activeChat._id]);

            // Mark as read immediately
            const payload = activeChat.isGroup
                ? { groupId: activeChat._id }
                : { conversationId: activeChat._id };
            socket?.emit('message.read', payload);
        }
    }, [activeChat]);

    useEffect(() => {
        if (!socket) return;

        socket.on('message.receive', (message) => {
            if (message.conversation_id === activeChat?._id || message.group_id === activeChat?._id) {
                setMessages((prev) => [...prev, message]);

                // Play sound if sender is NOT me
                if (message.sender._id !== user._id) {
                    audioRef.current.play().catch(e => console.log('Audio play failed', e));

                    // Mark as read if I'm looking at this chat
                    const payload = activeChat.isGroup
                        ? { groupId: activeChat._id }
                        : { conversationId: activeChat._id };
                    socket.emit('message.read', payload);
                }
            }
        });

        socket.on('message.read', ({ conversationId, groupId, userId }) => {
            if ((conversationId === activeChat?._id || groupId === activeChat?._id) && userId !== user._id) {
                // Update local messages to read
                setMessages(prev => prev.map(msg => ({ ...msg, status: 'read' })));
            }
        });

        socket.on('typing.start', ({ roomId, name }) => {
            if (roomId === activeChat?._id) {
                setTypingUser(name);
            }
        });

        socket.on('typing.stop', ({ roomId }) => {
            if (roomId === activeChat?._id) {
                setTypingUser(null);
            }
        });

        return () => {
            socket.off('message.receive');
            socket.off('typing.start');
            socket.off('typing.stop');
        };
    }, [socket, activeChat]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Backend route: /messages/:targetId (targetId = conversationId or groupId)
            const { data } = await api.get(`/messages/${activeChat._id}`);
            setMessages(data.data); // data is oldest-first from service
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachments([...attachments, data.data]);
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        try {
            const payload = activeChat.isGroup
                ? { group_id: activeChat._id, text: newMessage, attachments }
                : { recipient_id: activeChat._id, text: newMessage, attachments };

            await api.post('/messages', payload);

            setNewMessage('');
            setAttachments([]);
            socket?.emit('typing.stop', { roomId: activeChat._id });
        } catch (error) {
            console.error('Send failed', error);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket?.emit('typing.start', { roomId: activeChat._id });

        // Debounce stop typing?
        // simple timeout for now
        setTimeout(() => {
            socket?.emit('typing.stop', { roomId: activeChat._id });
        }, 3000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getPartnerName = () => {
        if (!activeChat) return '';
        if (activeChat.name) return activeChat.name; // Group
        const p = activeChat.participants.find(u => u._id !== user._id);
        return p ? p.name : 'Unknown';
    };

    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-transparent h-full">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <MessageSquare size={40} className="text-gray-500" />
                </div>
                <p className="text-lg font-medium">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center z-10 mx-4 mt-4 rounded-t-2xl">
                <div>
                    <h2 className="text-white font-bold text-lg tracking-wide">{getPartnerName()}</h2>
                    {typingUser && (
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 text-xs font-semibold animate-pulse">
                            {typingUser} is typing...
                        </p>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 mx-4 bg-black/20 backdrop-blur-sm">
                {loading && <p className="text-center text-gray-500 animate-pulse">Loading messages...</p>}

                {messages.map((msg, idx) => {
                    const isMe = msg.sender._id === user._id;
                    return (
                        <div
                            key={idx}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                        >
                            <div
                                className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.01] ${isMe
                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm'
                                    : 'bg-white/10 backdrop-blur-md text-gray-200 border border-white/5 rounded-bl-sm'
                                    }`}
                            >
                                {!isMe && activeChat.isGroup && <p className="text-xs text-gray-400 mb-1 font-medium">{msg.sender.name}</p>}

                                {msg.attachments?.map((att, i) => (
                                    <div key={i} className="mb-2 rounded-lg overflow-hidden border border-white/10">
                                        <img
                                            src={`http://localhost:5001${att.url}`}
                                            alt="attachment"
                                            className="max-w-full max-h-60 object-cover"
                                        />
                                    </div>
                                ))}

                                <p className="break-words leading-relaxed text-[15px]">{msg.text}</p>

                                <div className={`flex items-center justify-end space-x-1 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity`}>
                                    <span className="text-[10px] font-medium">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <span className="text-[10px] text-blue-200">
                                            {msg.status === 'read' ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 mx-4 mb-4 bg-white/5 backdrop-blur-md border-t border-white/5 rounded-b-2xl relative">
                {/* Upload Preview */}
                {attachments.length > 0 && (
                    <div className="flex space-x-3 mb-3 overflow-x-auto p-2">
                        {attachments.map((att, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={`http://localhost:5001${att.url}`}
                                    alt="preview"
                                    className="w-20 h-20 object-cover rounded-lg border border-white/20 shadow-lg"
                                />
                                <button
                                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="flex space-x-3 items-end relative z-20">
                    {/* Emoji Picker */}
                    {showEmoji && (
                        <div className="absolute bottom-20 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                            <EmojiPicker
                                theme="dark"
                                onEmojiClick={(emojiObject) => setNewMessage(prev => prev + emojiObject.emoji)}
                            />
                        </div>
                    )}

                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                    <div className="flex space-x-1 bg-black/20 rounded-xl p-1 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="p-2.5 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/5"
                        >
                            <Smile size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-white/5"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>

                    <input
                        className="flex-1 glass-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                    />

                    <button
                        type="submit"
                        className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newMessage.trim() && attachments.length === 0}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
