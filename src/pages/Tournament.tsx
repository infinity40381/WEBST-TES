import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Users, Calendar, Clock, MapPin, GamepadIcon, User, Crown, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, arrayUnion, getDoc, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Tournament {
  id: string;
  title: string;
  game: string;
  description: string;
  date: any;
  time: string;
  maxTeams: number;
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    photoURL: string;
  };
  teams: Array<{
    id: string;
    name: string;
    players: Array<{
      id: string;
      username: string;
      displayName: string;
      photoURL: string;
      gameId: string;
      rank: string;
    }>;
    side: 'team1' | 'team2';
  }>;
  status: 'upcoming' | 'ongoing' | 'completed';
  result?: {
    winner: string;
    score: string;
  };
  createdAt: any;
}

const Tournament: React.FC = () => {
  const { darkMode } = useTheme();
  const { user, userProfile } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create Tournament Form States
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxTeams, setMaxTeams] = useState(10);
  const [creating, setCreating] = useState(false);

  // Join Tournament Form States
  const [teamName, setTeamName] = useState('');
  const [gameId, setGameId] = useState('');
  const [rank, setRank] = useState('');
  const [selectedSide, setSelectedSide] = useState<'team1' | 'team2'>('team1');
  const [joining, setJoining] = useState(false);

  const games = [
    { id: 'valorant', name: 'Valorant', icon: '🎯' },
    { id: 'cs2', name: 'Counter-Strike 2', icon: '🔫' },
    { id: 'apex', name: 'Apex Legends', icon: '🏆' },
    { id: 'leagueoflegends', name: 'League of Legends', icon: '⚔️' },
    { id: 'fortnite', name: 'Fortnite', icon: '🏗️' },
    { id: 'overwatch', name: 'Overwatch 2', icon: '🛡️' }
  ];

  const ranks = {
    valorant: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
    cs2: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite'],
    apex: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Predator'],
    leagueoflegends: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
    fortnite: ['Open', 'Contender', 'Champion'],
    overwatch: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']
  };

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const tournamentData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Tournament[];
          setTournaments(tournamentData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !game || !date || !time) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setCreating(true);
      
      const tournamentData = {
        title,
        game,
        description,
        date: new Date(`${date}T${time}`),
        time,
        maxTeams,
        createdBy: {
          id: user?.uid,
          username: userProfile?.username,
          displayName: userProfile?.displayName,
          photoURL: userProfile?.photoURL || ''
        },
        teams: [],
        status: 'upcoming',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'tournaments'), tournamentData);
      
      toast.success('Turnuva başarıyla oluşturuldu!');
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Turnuva oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !gameId || !rank || !selectedTournament) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setJoining(true);

      // Check if tournament is full
      const sideTeams = selectedTournament.teams.filter(team => team.side === selectedSide);
      if (sideTeams.length >= selectedTournament.maxTeams / 2) {
        toast.error('Bu taraf dolu! Diğer tarafı deneyin.');
        return;
      }

      // Check if user already joined
      const userAlreadyJoined = selectedTournament.teams.some(team => 
        team.players.some(player => player.id === user?.uid)
      );

      if (userAlreadyJoined) {
        toast.error('Bu turnuvaya zaten katıldınız!');
        return;
      }

      const newTeam = {
        id: `team_${Date.now()}`,
        name: teamName,
        players: [{
          id: user?.uid,
          username: userProfile?.username,
          displayName: userProfile?.displayName,
          photoURL: userProfile?.photoURL || '',
          gameId,
          rank
        }],
        side: selectedSide
      };

      const tournamentRef = doc(db, 'tournaments', selectedTournament.id);
      await updateDoc(tournamentRef, {
        teams: arrayUnion(newTeam)
      });

      toast.success('Turnuvaya başarıyla katıldınız!');
      setShowJoinModal(false);
      setSelectedTournament(null);
      resetJoinForm();
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast.error('Turnuvaya katılırken hata oluştu');
    } finally {
      setJoining(false);
    }
  };

  const resetCreateForm = () => {
    setTitle('');
    setGame('');
    setDescription('');
    setDate('');
    setTime('');
    setMaxTeams(10);
  };

  const resetJoinForm = () => {
    setTeamName('');
    setGameId('');
    setRank('');
    setSelectedSide('team1');
  };

  const canJoinTournament = (tournament: Tournament) => {
    if (tournament.status !== 'upcoming') return false;
    if (tournament.teams.length >= tournament.maxTeams) return false;
    
    const userAlreadyJoined = tournament.teams.some(team => 
      team.players.some(player => player.id === user?.uid)
    );
    
    return !userAlreadyJoined;
  };

  const getTeamsBySide = (tournament: Tournament, side: 'team1' | 'team2') => {
    return tournament.teams.filter(team => team.side === side);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Turnuvalar</h1>
                <p className="text-purple-100">Oyun topluluğunda turnuvalara katıl ve yarış!</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold flex items-center transition-all duration-200 shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Turnuva Oluştur
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tournaments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">
                        {games.find(g => g.id === tournament.game)?.icon || '🎮'}
                      </span>
                      <h3 className="text-xl font-bold">{tournament.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : tournament.status === 'ongoing'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {tournament.status === 'upcoming' ? 'Yaklaşan' : 
                         tournament.status === 'ongoing' ? 'Devam Ediyor' : 'Tamamlandı'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">{tournament.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {format(tournament.date.toDate(), 'dd/MM/yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {tournament.time}
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {tournament.teams.length}/{tournament.maxTeams} Takım
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                        {tournament.createdBy.photoURL ? (
                          <img src={tournament.createdBy.photoURL} alt="Organizer" className="w-full h-full object-cover" />
                        ) : (
                          <Crown size={16} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{tournament.createdBy.displayName}</div>
                        <div className="text-xs text-gray-500">Organizatör</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teams Display */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold text-sm mb-2 text-blue-500">Takım 1</h4>
                    <div className="space-y-1">
                      {getTeamsBySide(tournament, 'team1').map((team) => (
                        <div key={team.id} className="text-xs">
                          <span className="font-medium">{team.name}</span>
                          <span className="text-gray-500 ml-1">({team.players.length} oyuncu)</span>
                        </div>
                      ))}
                      {getTeamsBySide(tournament, 'team1').length === 0 && (
                        <div className="text-xs text-gray-400">Henüz takım yok</div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold text-sm mb-2 text-red-500">Takım 2</h4>
                    <div className="space-y-1">
                      {getTeamsBySide(tournament, 'team2').map((team) => (
                        <div key={team.id} className="text-xs">
                          <span className="font-medium">{team.name}</span>
                          <span className="text-gray-500 ml-1">({team.players.length} oyuncu)</span>
                        </div>
                      ))}
                      {getTeamsBySide(tournament, 'team2').length === 0 && (
                        <div className="text-xs text-gray-400">Henüz takım yok</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {canJoinTournament(tournament) ? (
                    <button
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setShowJoinModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                    >
                      <Target size={16} className="inline mr-1" />
                      Katıl
                    </button>
                  ) : tournament.teams.length >= tournament.maxTeams ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
                    >
                      Turnuva Dolu
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
                    >
                      Zaten Katıldınız
                    </button>
                  )}
                  
                  <button className={`px-4 py-2 rounded-lg font-medium transition ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                    Detaylar
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Trophy size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Henüz turnuva yok</h3>
            <p className="text-gray-500 mb-4">İlk turnuvayı sen oluştur!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
            >
              Turnuva Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`w-full max-w-2xl rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} overflow-hidden shadow-xl`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 border-gray-200">
                <h2 className="text-2xl font-bold">Turnuva Oluştur</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateTournament} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Turnuva Başlığı</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Valorant Şampiyonası"
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Oyun</label>
                    <select
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                      required
                    >
                      <option value="">Oyun seçin</option>
                      {games.map(gameOption => (
                        <option key={gameOption.id} value={gameOption.id}>
                          {gameOption.icon} {gameOption.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tarih</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Saat</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Maksimum Takım Sayısı</label>
                    <select
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                    >
                      <option value={4}>4 Takım</option>
                      <option value={8}>8 Takım</option>
                      <option value={10}>10 Takım</option>
                      <option value={16}>16 Takım</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Açıklama</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Turnuva hakkında detaylar..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-6 py-3 rounded-xl font-semibold transition ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition flex items-center"
                  >
                    {creating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Trophy size={20} className="mr-2" />
                    )}
                    Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Tournament Modal */}
      <AnimatePresence>
        {showJoinModal && selectedTournament && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`w-full max-w-lg rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} overflow-hidden shadow-xl`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 border-gray-200">
                <h2 className="text-xl font-bold">Turnuvaya Katıl</h2>
                <button 
                  onClick={() => {
                    setShowJoinModal(false);
                    setSelectedTournament(null);
                  }}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleJoinTournament} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Takım Adı</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Takımınızın adını girin"
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Oyun ID'niz</label>
                  <input
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    placeholder="Oyundaki kullanıcı adınız"
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rankınız</label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                    required
                  >
                    <option value="">Rank seçin</option>
                    {selectedTournament.game && ranks[selectedTournament.game as keyof typeof ranks]?.map(rankOption => (
                      <option key={rankOption} value={rankOption}>
                        {rankOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Takım Seçimi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSide('team1')}
                      className={`p-3 rounded-xl border-2 transition ${
                        selectedSide === 'team1'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-blue-500">Takım 1</div>
                        <div className="text-xs text-gray-500">
                          {getTeamsBySide(selectedTournament, 'team1').length}/{selectedTournament.maxTeams / 2} takım
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedSide('team2')}
                      className={`p-3 rounded-xl border-2 transition ${
                        selectedSide === 'team2'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-red-500">Takım 2</div>
                        <div className="text-xs text-gray-500">
                          {getTeamsBySide(selectedTournament, 'team2').length}/{selectedTournament.maxTeams / 2} takım
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setSelectedTournament(null);
                    }}
                    className={`px-6 py-3 rounded-xl font-semibold transition ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={joining}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition flex items-center"
                  >
                    {joining ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Target size={20} className="mr-2" />
                    )}
                    Katıl
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tournament;