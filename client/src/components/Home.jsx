import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  BarChart3, 
  Crown, 
  Zap, 
  Sparkles, 
  Cpu,
  Brain,
  Shield,
  TrendingUp,
  CloudLightning,
  Bot,
  Calendar,
  Clock,
  Star,
  Award,
  Target
} from 'lucide-react';

const GamingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 120,
    ping: 28,
    kdRatio: 2.4,
    winRate: 68
  });
  
  const [aiRecommendations, setAiRecommendations] = useState([
    "Based on your play style, try using more cover in open areas",
    "Your accuracy improves with sniper rifles - consider specializing",
    "Team up with players who complement your aggressive style"
  ]);
  
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, name: "Weekly Tournament", date: "Tomorrow", prize: "$5,000", participants: 243 },
    { id: 2, name: "New Season Launch", date: "in 3 days", newContent: "Maps & Weapons" },
    { id: 3, name: "Pro Player AMA", date: "in 5 days", guest: "Ninja" }
  ]);
  
  const [liveMatches, setLiveMatches] = useState([
    { id: 1, game: "Valorant", players: 8, status: "ongoing", duration: "25m" },
    { id: 2, game: "Fortnite", players: 12, status: "final", duration: "18m" },
    { id: 3, game: "League of Legends", players: 10, status: "draft", duration: "5m" }
  ]);
  
  const [playerStats, setPlayerStats] = useState({
    level: 47,
    rank: "Diamond III",
    hoursPlayed: 342,
    achievements: 28
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        fps: Math.floor(Math.random() * 60) + 90,
        ping: Math.floor(Math.random() * 20) + 20,
        kdRatio: parseFloat((Math.random() * 1.5 + 1.5).toFixed(1)),
        winRate: Math.floor(Math.random() * 20) + 50
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Gamepad2 className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            NEXUS GAMING PLATFORM
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Online</span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold">
            P
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-purple-900">
          <h2 className="text-xl font-bold mb-2">Welcome, Commander!</h2>
          <p className="text-gray-400 mb-4">Your gaming hub is powered by advanced AI algorithms and real-time analytics</p>
          <div className="flex space-x-4">
            <div className="flex items-center bg-purple-900 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 mr-1 text-yellow-400" />
              <span>Performance Boost Active</span>
            </div>
            <div className="flex items-center bg-blue-900 px-3 py-1 rounded-full">
              <CloudLightning className="w-4 h-4 mr-1 text-blue-400" />
              <span>Cloud Streaming Ready</span>
            </div>
          </div>
        </div>
        
        {/* Player Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
          <h3 className="font-semibold mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{playerStats.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">{playerStats.rank}</div>
              <div className="text-sm text-gray-400">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{playerStats.hoursPlayed}</div>
              <div className="text-sm text-gray-400">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{playerStats.achievements}</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6 bg-gray-800 p-1 rounded-lg w-full max-w-3xl mx-auto">
        {['overview', 'performance', 'ai', 'social', 'marketplace'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md transition-all capitalize flex items-center justify-center ${activeTab === tab ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
          >
            {tab === 'overview' && <Sparkles className="w-4 h-4 mr-2" />}
            {tab === 'performance' && <BarChart3 className="w-4 h-4 mr-2" />}
            {tab === 'ai' && <Brain className="w-4 h-4 mr-2" />}
            {tab === 'social' && <Users className="w-4 h-4 mr-2" />}
            {tab === 'marketplace' && <TrendingUp className="w-4 h-4 mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Real-Time Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">FPS</span>
                  <span className="text-green-400">{performanceMetrics.fps}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (performanceMetrics.fps / 240) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Ping (ms)</span>
                  <span className="text-blue-400">{performanceMetrics.ping}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.max(5, 100 - (performanceMetrics.ping / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">K/D Ratio</span>
                  <span className="text-purple-400">{performanceMetrics.kdRatio}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (performanceMetrics.kdRatio / 4) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Win Rate %</span>
                  <span className="text-pink-400">{performanceMetrics.winRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full" 
                    style={{ width: `${performanceMetrics.winRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-gray-400">{event.date}</div>
                  </div>
                  <div className="text-right">
                    {event.prize && <div className="text-yellow-400 text-sm">{event.prize}</div>}
                    {event.participants && <div className="text-gray-400 text-sm">{event.participants} players</div>}
                    {event.newContent && <div className="text-green-400 text-sm">{event.newContent}</div>}
                    {event.guest && <div className="text-purple-400 text-sm">with {event.guest}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Feature Showcase */}
        <div className="space-y-6">
          {/* AI-Powered Recommendations */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              AI-Powered Recommendations
            </h3>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-700 rounded-lg">
                  <Bot className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-purple-700 hover:bg-purple-600 py-2 rounded-lg transition-colors">
              Generate More Suggestions
            </button>
          </div>

          {/* Advanced Matchmaking */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Advanced Matchmaking
            </h3>
            <p className="text-gray-400 mb-4">Our algorithm finds perfect matches based on skill, play style, and preferences</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">92%</div>
                <div className="text-xs text-gray-400">Match Quality</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-400">45s</div>
                <div className="text-xs text-gray-400">Avg. Wait Time</div>
              </div>
            </div>
            <button className="w-full bg-green-700 hover:bg-green-600 py-2 rounded-lg transition-colors flex items-center justify-center">
              <Target className="w-4 h-4 mr-2" />
              Find Match
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Matches */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-red-400" />
              Live Matches
            </h3>
            <div className="space-y-4">
              {liveMatches.map(match => (
                <div key={match.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{match.game}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      match.status === 'ongoing' ? 'bg-green-900 text-green-300' :
                      match.status === 'final' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{match.players} players</span>
                    <span>{match.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors">
              View All Matches
            </button>
          </div>

          {/* Achievement Progress */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Achievement Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Headshot Expert</span>
                  <span className="text-sm text-gray-400">75%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Team Player</span>
                  <span className="text-sm text-gray-400">60%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Completionist</span>
                  <span className="text-sm text-gray-400">40%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-900">
            <h3 className="font-semibold mb-4 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-pink-400" />
              Advanced Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">Real-time performance optimization</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Predictive matchmaking algorithm</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm">Neural network-based cheat detection</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm">Personalized content recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Nexus Gaming Platform • Powered by Advanced AI Algorithms • v2.4.1</p>
      </footer>
    </div>
  );
};

export default GamingDashboard;