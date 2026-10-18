import React, { useState, useEffect } from 'react';
import { 
  Shield, Sparkles, Terminal, Code, Cpu, Trophy, User, 
  LogIn, Lock, Menu, X, LogOut, Plus, Send, Play, 
  CheckSquare, Briefcase 
} from 'lucide-react';

export default function App() {
  // --- CORE SYSTEM STATES ---
  // Forces the app to start safely in guest mode every time it loads
  const [userRole, setUserRole] = useState('guest'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('snippetHub');
  const [showLogin, setShowLogin] = useState(false);
  const [mumuPoints, setMumuPoints] = useState(() => {
    return parseInt(localStorage.getItem('mumuPoints')) || 0;
  });

  // --- LOGIN STATES ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Save points to local storage
  useEffect(() => {
    localStorage.setItem('mumuPoints', mumuPoints);
  }, [mumuPoints]);

  // --- HANDLERS ---
  const handleNavigation = (tab) => {
    // Lock out guests from restricted areas
    if (userRole === 'guest' && tab !== 'snippetHub' && tab !== 'arcadeLounge') {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Bug fix: Auto-closes mobile menu on tap
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'admin@nexus.com' && loginPassword === 'admin123') {
      setUserRole('admin');
      setShowLogin(false);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setActiveTab('snippetHub');
    setIsMobileMenuOpen(false);
  };

  const awardPoints = (amount) => {
    setMumuPoints((prev) => prev + amount);
  };

  // --- PAGE CONTENT RENDERER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'snippetHub':
        return (
          <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Snippet Hub</h1>
                <p className="text-gray-400 text-sm md:text-base">Public library of quick code utilities.</p>
              </div>
              {userRole === 'admin' && (
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 md:px-4 rounded flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> <span className="hidden md:inline">Add Snippet</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#12121a] p-6 rounded-lg border border-white/10 hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-indigo-400">Center A Div</h3>
                  <Code className="w-5 h-5 text-gray-500" />
                </div>
                <pre className="bg-[#050505] p-4 rounded text-sm text-gray-300 overflow-x-auto">
                  {`display: flex;\njustify-content: center;\nalign-items: center;`}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'arcadeLounge':
        return (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Arcade Lounge</h1>
            <p className="text-gray-400 mb-8 text-sm md:text-base">Play games to earn MuMu points.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#12121a] p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                <Cpu className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Memory Match</h3>
                <button 
                  onClick={() => awardPoints(10)}
                  className="mt-4 bg-pink-600/20 text-pink-500 hover:bg-pink-600 hover:text-white px-6 py-2 rounded-full transition-all"
                >
                  Play (+10 MuMu)
                </button>
              </div>
            </div>
          </div>
        );

      case 'auraBot':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-white/10">
              <h1 className="text-xl md:text-2xl font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6" /> Aura AI Tutor
              </h1>
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#12121a] p-4 rounded-2xl rounded-tl-none border border-white/10 max-w-[85%] md:max-w-[80%]">
                  <p className="text-sm md:text-base">Hello Prince! I am Aura. My AI connection is currently awaiting the Vercel API Key injection.</p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0f]">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask Aura anything..." 
                  className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg transition-colors shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'studyPlanner':
        return (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Study Planner</h1>
            <div className="bg-[#12121a] p-8 rounded-lg border border-dashed border-white/20 text-center mt-8">
              <CheckSquare className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Your Schedule is Clear</h3>
            </div>
          </div>
        );

      case 'bagPacker':
        return (
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Bag Packer</h1>
            <div className="bg-[#12121a] p-8 rounded-lg border border-white/10 flex items-center justify-center mt-8">
              <div className="text-center">
                <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Inventory system currently empty.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans relative">
      
      {/* 1. MOBILE TOP HEADER */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="font-bold text-lg text-indigo-400 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Nexus Studio
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {mumuPoints}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1 text-white hover:text-indigo-400"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 2. MOBILE MENU OVERLAY (Clicks to close) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* 3. RESPONSIVE SIDEBAR */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Desktop Sidebar Header */}
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tight">NEXUS</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Studio OS</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <div className="text-xs font-bold text-gray-600 uppercase mb-4 px-3">Public Access</div>
          
          <button onClick={() => handleNavigation('snippetHub')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'snippetHub' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Code className="w-5 h-5" /> Snippet Hub
          </button>
          
          <button onClick={() => handleNavigation('arcadeLounge')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'arcadeLounge' ? 'bg-pink-600/10 text-pink-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Play className="w-5 h-5" /> Arcade Lounge
          </button>

          <div className="text-xs font-bold text-gray-600 uppercase mb-4 mt-8 px-3">Restricted Access</div>

          <button onClick={() => handleNavigation('auraBot')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'auraBot' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> Aura AI Bot</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>

          <button onClick={() => handleNavigation('studyPlanner')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'studyPlanner' ? 'bg-emerald-600/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><CheckSquare className="w-5 h-5" /> AI Study Planner</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>

          <button onClick={() => handleNavigation('bagPacker')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'bagPacker' ? 'bg-orange-600/10 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> Bag Packer</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
        </nav>

        {/* User Status Footer */}
        <div className="p-4 border-t border-white/10 bg-[#050505]/50">
          <div className="hidden md:flex bg-[#12121a] rounded-lg p-3 items-center justify-between mb-4 border border-white/5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-gray-300">MuMu Vault</span>
            </div>
            <span className="text-yellow-500 font-mono text-sm">{mumuPoints}</span>
          </div>

          {userRole === 'guest' ? (
            <button 
              onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-indigo-600/20"
            >
              <LogIn className="w-4 h-4" /> System Login
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[#12121a] p-3 rounded-lg border border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Nexus Admin</div>
                  <div className="text-[10px] text-indigo-400 uppercase tracking-wider">Full Access</div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {/* Bug fix: pt-16 prevents the mobile header from covering your content */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-y-auto overflow-x-hidden relative bg-[#050505]">
        {renderContent()}
      </div>

      {/* --- SECURE LOGIN MODAL --- */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                <Shield className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Secure Access</h2>
              <p className="text-gray-400 text-sm mt-2">Authenticate to unlock restricted tools.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                  placeholder="admin@nexus.com"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs text-center p-3 rounded-lg font-medium">
                  {loginError}
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-bold mt-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Initialize Login
              </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-gray-600 font-mono bg-white/5 py-2 rounded">
              Dev Test: admin@nexus.com / admin123
            </div>
          </div>
        </div>
      )}
    </div>
  );
}