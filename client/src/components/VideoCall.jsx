import React, { useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const VideoCall = ({ isReceivingCall, callAccepted, endCall, stream, userVideo, myVideo, answerCall, isCalling, name }) => {

    // UI Local States
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const toggleMic = () => {
        setMicOn(!micOn);
        if (stream) stream.getAudioTracks()[0].enabled = !micOn;
    };

    const toggleVideo = () => {
        setVideoOn(!videoOn);
        if (stream) stream.getVideoTracks()[0].enabled = !videoOn;
    };

    if (!isReceivingCall && !isCalling && !callAccepted) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-[#1f1f2e] rounded-2xl overflow-hidden shadow-2xl border border-white/10 m-4">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center">
                    <h2 className="text-white text-lg font-semibold">
                        {callAccepted ? 'In Call' : isCalling ? 'Calling...' : 'Incoming Call'}
                    </h2>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[600px] h-[80vh]">

                    {/* My Video */}
                    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                        {stream && (
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                            You
                        </div>
                    </div>

                    {/* User Video */}
                    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                        {callAccepted && !isCalling ? (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold animate-pulse">
                                    {(name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <p className="text-white/70 text-lg">
                                    {isCalling ? 'Calling...' : isReceivingCall ? `${name} is calling...` : 'Connecting...'}
                                </p>
                            </div>
                        )}
                        {callAccepted && (
                            <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                                {name}
                            </div>
                        )}
                    </div>

                </div>

                {/* Controls */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">

                    <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white transition-all`}>
                        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button onClick={endCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all scale-110 shadow-lg shadow-red-500/50">
                        <X size={32} />
                    </button>

                    <button onClick={toggleVideo} className={`p-4 rounded-full ${videoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white transition-all`}>
                        {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    {isReceivingCall && !callAccepted && (
                        <button onClick={answerCall} className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all scale-110 animate-bounce shadow-lg shadow-green-500/50 ml-4">
                            Answer
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VideoCall;
