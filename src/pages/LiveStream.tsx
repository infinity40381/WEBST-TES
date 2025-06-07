import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Users, MessageSquare, Settings, Play, Pause, Volume2, VolumeX, Maximize, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const LiveStream: React.FC = () => {
  const { darkMode } = useTheme();
  const { user, userProfile } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');
  const [gameCategory, setGameCategory] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'viewer1', message: 'Great stream!', timestamp: new Date() },
    { id: 2, user: 'gamer123', message: 'What\'s your rank?', timestamp: new Date() },
    { id: 3, user: 'pro_player', message: 'Nice play!', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // ZegoCloud integration will be implemented here
  const initializeZegoCloud = () => {
    // TODO: Initialize ZegoCloud SDK
    console.log('Initializing ZegoCloud...');
  };

  useEffect(() => {
    initializeZegoCloud();
  }, []);

  const startStream = () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }
    
    setIsStreaming(true);
    setViewers(Math.floor(Math.random() * 50) + 1);
  };

  const stopStream = () => {
    setIsStreaming(false);
    setViewers(0);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        user: userProfile?.username || 'You',
        message: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Video size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live Stream Studio</h1>
              <p className="text-purple-100">Connect with your gaming community in real-time</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!isStreaming ? (
            // Stream Setup
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Stream Title
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Enter your stream title..."
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Game Category
                  </label>
                  <select
                    value={gameCategory}
                    onChange={(e) => setGameCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                  >
                    <option value="">Select a game...</option>
                    <option value="valorant">Valorant</option>
                    <option value="cs2">Counter-Strike 2</option>
                    <option value="leagueoflegends">League of Legends</option>
                    <option value="fortnite">Fortnite</option>
                    <option value="minecraft">Minecraft</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 py-6">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isCameraOn 
                      ? 'bg-green-500 hover:bg-green-600 shadow-lg' 
                      : 'bg-red-500 hover:bg-red-600 shadow-lg'
                  } text-white`}
                >
                  {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isMicOn 
                      ? 'bg-green-500 hover:bg-green-600 shadow-lg' 
                      : 'bg-red-500 hover:bg-red-600 shadow-lg'
                  } text-white`}
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                <button className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg">
                  <Settings size={24} />
                </button>
              </div>

              <button
                onClick={startStream}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play size={24} className="inline mr-2" />
                Start Live Stream
              </button>
            </div>
          ) : (
            // Live Stream Interface
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-bold text-lg">LIVE</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                    <Users size={18} className="text-purple-600" />
                    <span className="font-semibold text-purple-600">{viewers} viewers</span>
                  </div>
                </div>

                <button
                  onClick={stopStream}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 shadow-lg"
                >
                  <Pause size={20} className="inline mr-2" />
                  End Stream
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Video Stream Area */}
                <div className="lg:col-span-3 space-y-4">
                  <div className={`aspect-video rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center relative overflow-hidden shadow-xl`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
                    <div className="text-center z-10">
                      <Video size={64} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 text-lg font-medium">Stream video will appear here</p>
                      <p className="text-sm text-gray-400 mt-2">
                        ZegoCloud integration: Video stream component
                      </p>
                    </div>
                    
                    {/* Stream Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
                          <Volume2 size={20} />
                        </button>
                        <button className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
                          <Share2 size={20} />
                        </button>
                      </div>
                      <button className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
                        <Maximize size={20} />
                      </button>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h2 className="text-2xl font-bold mb-2">{streamTitle}</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                          {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="Streamer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-bold">{userProfile?.username?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{userProfile?.displayName}</div>
                          <div className="text-sm text-gray-500">@{userProfile?.username}</div>
                        </div>
                      </div>
                      {gameCategory && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm`}>
                          #{gameCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className={`rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col h-96 lg:h-auto`}>
                  <div className="p-4 border-b dark:border-gray-600 border-gray-200">
                    <h3 className="font-semibold flex items-center">
                      <MessageSquare size={18} className="mr-2 text-purple-500" />
                      Live Chat
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="font-semibold text-purple-500">{msg.user}:</span>
                        <span className="ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t dark:border-gray-600 border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        }`}
                      />
                      <button 
                        onClick={sendChatMessage}
                        className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stream Controls */}
              <div className="flex items-center justify-center space-x-6 py-4">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isCameraOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white shadow-lg`}
                >
                  {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isMicOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white shadow-lg`}
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                <button className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg">
                  <Settings size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ZegoCloud Integration Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Settings size={24} className="mr-3 text-purple-500" />
            Nasıl kullanılır?
          </h2>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-l-4 border-purple-500`}>
            <p className="text-sm mb-4 font-medium">
              yayın için bunları yapmanız gerekiyor:
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>yayın başlığı belirleyin</li>
              <li>yayın kategorisi seçin</li>
              <li>kamerayı açın</li>
              <li>mikrofonu açın</li>
              <li>yayını başlatın</li>
              <li>yayın sırasında sohbeti kullanın</li>
              <li>yayını durdurmak istediğinizde durdurun</li>
              <li>yayın sırasında izleyici sayısını takip edin</li>
              <li>yayın sırasında oyun kategorisini güncelleyin</li>
              <li>yayın sırasında sohbet mesajlarını takip edin</li>
              <li>yayın sırasında kullanıcı profilinizi güncelleyin</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStream;