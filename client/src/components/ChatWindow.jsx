import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, Paperclip, X, MessageSquare, Video } from 'lucide-react'; // Added Video icon
import EmojiPicker from 'emoji-picker-react';
import Peer from 'simple-peer'; // Import Peer
import VideoCall from './VideoCall'; // Import VideoCall Component
import { encryptMessage, decryptMessage } from '../utils/encryptionUtils';

const ChatWindow = ({ activeChat }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const audioRef = useRef(
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
  );

  // --- VIDEO CALL STATES ---
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [name, setName] = useState(''); // Name of caller
  const [isCalling, setIsCalling] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  // -------------------------

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${activeChat._id}`);
      setMessages(data.data);
    } catch {
      console.error('Failed to fetch messages');
    }
    setLoading(false);
  };

  const leaveCall = useCallback(() => {
    setCallAccepted(false);
    setReceivingCall(false);
    setIsCalling(false);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Notify other user
    const partner = activeChat && !activeChat.isGroup
      ? activeChat.participants.find((u) => u._id !== user._id)?._id
      : null;
    if (partner && socket) {
      socket.emit('callended', { to: partner });
    }

    // Clean up socket listener for this call
    if (socket) {
      socket.off('callaccepted');
    }
  }, [stream, socket, activeChat, user._id]);

  const getPartnerName = () => {
    if (!activeChat) return '';
    if (activeChat.name) return activeChat.name;
    const p = activeChat.participants.find((u) => u._id !== user._id);
    return p ? p.name : 'Unknown';
  };

  const getPartnerId = () => {
    if (!activeChat || activeChat.isGroup) return null;
    const p = activeChat.participants.find((u) => u._id !== user._id);
    return p ? p._id : null;
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message.receive', (message) => {
      if (message.conversation_id === activeChat?._id || message.group_id === activeChat?._id) {
        setMessages((prev) => [...prev, message]);
        if (message.sender._id !== user._id) {
          audioRef.current.play().catch((e) => console.log('Audio play failed', e));
          const payload = activeChat.isGroup
            ? { groupId: activeChat._id }
            : { conversationId: activeChat._id };
          socket.emit('message.read', payload);
        }
      }
    });

    socket.on('message.read', ({ conversationId, groupId, userId }) => {
      if (
        (conversationId === activeChat?._id || groupId === activeChat?._id) &&
        userId !== user._id
      ) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, status: 'read' })));
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

    // --- VIDEO CALL SOCKET EVENTS ---
    socket.on('calluser', (data) => {
      // Only accept if not already in call ? For now simple.
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('callended', () => {
      // Remote ended call
      leaveCall();
    });
    // --------------------------------

    return () => {
      socket.off('message.receive');
      socket.off('typing.start');
      socket.off('typing.stop');
      socket.off('calluser');
      socket.off('callended');
    };
  }, [socket, activeChat, user._id, leaveCall]);

  // --- VIDEO CALL FUNCTIONS ---
  const callUser = (id) => {
    setIsCalling(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream
      });

      peer.on('signal', (data) => {
        socket.emit('calluser', {
          userToCall: id, // Target User ID
          signalData: data,
          from: user._id,
          name: user.name
        });
      });

      peer.on('stream', (currentStream) => {
        if (userVideo.current) userVideo.current.srcObject = currentStream;
      });

      socket.on('callaccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    setIsCalling(false);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream
      });

      peer.on('signal', (data) => {
        socket.emit('answercall', { signal: data, to: caller });
      });

      peer.on('stream', (currentStream) => {
        if (userVideo.current) userVideo.current.srcObject = currentStream;
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    });
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

    const encryptedText = encryptMessage(newMessage);
    const tempId = Date.now(); // For optimistic UI tracking

    // Optimistic UI: Show message immediately
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: user._id, name: user.name, profile_pic: user.profile_pic },
      text: encryptedText,
      attachments,
      createdAt: new Date().toISOString(),
      status: 'sending',
      conversation_id: activeChat.isGroup ? null : activeChat._id,
      group_id: activeChat.isGroup ? activeChat._id : null
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setAttachments([]);
    socket?.emit('typing.stop', { roomId: activeChat._id });

    // Send via Socket.io for real-time
    if (socket) {
      socket.emit('message.send', {
        targetId: activeChat._id,
        text: encryptedText,
        isGroup: activeChat.isGroup || false,
        tempId
      });

      // Listen for confirmation and update optimistic message
      socket.once('message.sent', ({ tempId: confirmedTempId, message }) => {
        if (confirmedTempId === tempId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId ? { ...message, status: 'sent' } : msg
            )
          );
        }
      });

      // Handle error
      socket.once('error', ({ message: errorMsg }) => {
        console.error('Send failed:', errorMsg);
        // Mark optimistic message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, status: 'failed' } : msg
          )
        );
      });
    } else {
      // Fallback to HTTP if socket not connected
      try {
        const payload = activeChat.isGroup
          ? { group_id: activeChat._id, text: encryptedText, attachments }
          : { recipient_id: activeChat._id, text: encryptedText, attachments };
        const { data } = await api.post('/messages', payload);
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? data.data : msg))
        );
      } catch (error) {
        console.error('Send failed', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, status: 'failed' } : msg
          )
        );
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket?.emit('typing.start', { roomId: activeChat._id });
    setTimeout(() => {
      socket?.emit('typing.stop', { roomId: activeChat._id });
    }, 3000);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-transparent h-full">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <MessageSquare size={40} className="text-gray-500" />
        </div>
        <p className="text-lg font-medium">Select a conversation to start chatting</p>
        {/* Show Incoming Call if any even if no chat selected */}
        {receivingCall && !callAccepted && (
          <VideoCall
            isReceivingCall={receivingCall}
            answerCall={answerCall}
            endCall={leaveCall}
            name={name}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* VIDEO CALL COMPONENT */}
      {(callAccepted || isCalling || receivingCall) && (
        <VideoCall
          stream={stream}
          callAccepted={callAccepted}
          myVideo={myVideo}
          userVideo={userVideo}
          endCall={leaveCall}
          answerCall={answerCall}
          callUser={() => { }}
          isReceivingCall={receivingCall}
          caller={caller}
          name={name}
          isCalling={isCalling}
        />
      )}

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
        {/* Video Call Button - Only for 1-on-1 */}
        {!activeChat.isGroup && (
          <button
            onClick={() => callUser(getPartnerId())}
            className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-full transition-all"
          >
            <Video size={20} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mx-4 bg-black/20 backdrop-blur-sm">
        {loading && <p className="text-center text-gray-500 animate-pulse">Loading messages...</p>}
        {messages.map((msg, idx) => {
          const isMe = msg.sender._id === user._id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
              <div
                className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.01] ${isMe ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm' : 'bg-white/10 backdrop-blur-md text-gray-200 border border-white/5 rounded-bl-sm'}`}
              >
                {!isMe && activeChat.isGroup && (
                  <p className="text-xs text-gray-400 mb-1 font-medium">{msg.sender.name}</p>
                )}
                {msg.attachments?.map((att, i) => (
                  <div key={i} className="mb-2 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={
                        att.url.startsWith('http')
                          ? att.url
                          : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${att.url}`
                      }
                      alt="attachment"
                      className="max-w-full max-h-60 object-cover"
                    />
                  </div>
                ))}
                <p className="break-words leading-relaxed text-[15px]">
                  {decryptMessage(msg.text)}
                </p>
                <div
                  className={`flex items-center justify-end space-x-1 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity`}
                >
                  <span className="text-[10px] font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
        {attachments.length > 0 && (
          <div className="flex space-x-3 mb-3 overflow-x-auto p-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                <img
                  src={
                    att.url.startsWith('http')
                      ? att.url
                      : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${att.url}`
                  }
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
          {showEmoji && (
            <div className="absolute bottom-20 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiObject) => setNewMessage((prev) => prev + emojiObject.emoji)}
              />
            </div>
          )}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
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
