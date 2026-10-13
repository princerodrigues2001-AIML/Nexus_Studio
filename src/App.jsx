import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Settings,
  X,
  Loader2,
  AlertCircle,
  Code2,
  Gamepad2,
  FlaskConical,
  CalendarDays,
  Backpack,
  Gem,
  Lock,
  LogIn,
  LogOut,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Link,
  Search,
  Copy,
  Check,
  Trophy,
  Plus,
  Edit2,
} from 'lucide-react';

// Cryptographic helper for secure local password storage (SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const MOCK_SNIPPETS = [
  {
    id: 1,
    title: 'Center a Div',
    category: 'CSS',
    code: 'display: flex;\njustify-content: center;\nalign-items: center;',
  },
  {
    id: 2,
    title: 'Fetch API Wrapper',
    category: 'JS',
    code: 'const fetcher = url => fetch(url).then(r => r.json());',
  },
  {
    id: 3,
    title: 'React State Hook',
    category: 'React',
    code: 'const [val, setVal] = useState(initial);',
  },
];

export default function App() {
  // Navigation & Auth State
  const [activeTab, setActiveTab] = useState('snippets');
  // TEMPORARY FOR TESTING: Set default role to 'admin' to bypass login screen
  const [userRole, setUserRole] = useState('admin');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const isLoggedIn = userRole !== 'guest';

  // Snippets State (Persistent)
  const [snippets, setSnippets] = useState(() => {
    const saved = localStorage.getItem('nexus_snippets');
    return saved ? JSON.parse(saved) : MOCK_SNIPPETS;
  });

  useEffect(() => {
    localStorage.setItem('nexus_snippets', JSON.stringify(snippets));
  }, [snippets]);

  // Gamification State
  const [mumuBalance, setMumuBalance] = useState(() => {
    const saved = localStorage.getItem('nexus_mumu');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('nexus_mumu', mumuBalance);
  }, [mumuBalance]);

  const addMuMu = (amount) => {
    setMumuBalance((prev) => prev + amount);
  };

  const NAV_ITEMS = [
    { id: 'snippets', label: 'Snippet Hub', icon: Code2, isPublic: true },
    { id: 'arcade', label: 'Arcade Lounge', icon: Gamepad2, isPublic: true },
    {
      id: 'future',
      label: 'Future Module Lab',
      icon: FlaskConical,
      isPublic: true,
    },
    { id: 'aura', label: 'Aura AI Bot', icon: Bot, isPublic: false },
    {
      id: 'planner',
      label: 'AI Study Planner',
      icon: CalendarDays,
      isPublic: false,
    },
    {
      id: 'packer',
      label: 'Routine & Packer',
      icon: Backpack,
      isPublic: false,
    },
    { id: 'vault', label: 'MuMu Vault', icon: Gem, isPublic: false },
  ];

  const handleTabChange = (tabId) => {
    const tab = NAV_ITEMS.find((t) => t.id === tabId);
    if (!tab.isPublic && !isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {}
      <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col z-20 shadow-xl hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">
              NEXUS
            </h1>
            <p className="text-[10px] text-indigo-400/80 font-bold tracking-[0.2em] uppercase">
              Studio OS
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider">
            Public Access
          </div>
          {NAV_ITEMS.filter((item) => item.isPublic).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}

          <div className="text-xs font-semibold text-slate-500 mt-6 mb-2 px-3 uppercase tracking-wider flex justify-between items-center">
            Restricted Access
            {!isLoggedIn && <Lock className="w-3 h-3 text-slate-600" />}
          </div>
          {NAV_ITEMS.filter((item) => !item.isPublic).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" /> {item.label}
              </div>
              {!isLoggedIn && <Lock className="w-3 h-3 opacity-50" />}
            </button>
          ))}
        </nav>

        {}
        <div className="p-4 border-t border-slate-800">
          {isLoggedIn ? (
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {userRole === 'admin' ? 'Nexus Admin' : 'Student User'}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Authenticated
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserRole('guest');
                  setActiveTab('snippets');
                  setLoginPassword('');
                }}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-sm font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-[#111827]/80 backdrop-blur-md z-10">
          <div className="md:hidden font-bold text-white tracking-widest">
            NEXUS
          </div>
          <div className="hidden md:block text-slate-400 font-medium">
            {NAV_ITEMS.find((t) => t.id === activeTab)?.label}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
              <Gem className="w-4 h-4 text-fuchsia-400" />
              <span className="text-sm font-bold text-fuchsia-100">
                {mumuBalance}
              </span>
              <span className="text-[10px] uppercase font-bold text-fuchsia-400/80">
                MuMu
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#0B0F19] relative">
          {activeTab === 'snippets' && (
            <SnippetHub
              snippets={snippets}
              setSnippets={setSnippets}
              isAdmin={userRole === 'admin'}
            />
          )}
          {activeTab === 'arcade' && <ArcadeLounge addMuMu={addMuMu} />}
          {activeTab === 'future' && <FutureLab />}
          {activeTab === 'aura' && <AuraChat />}
          {activeTab === 'planner' && <StudyPlanner />}
          {activeTab === 'packer' && <RoutinePacker />}
          {activeTab === 'vault' && <MuMuVault balance={mumuBalance} />}
        </main>
      </div>

      {}
      {showAuthModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {isSignUp ? 'Create Nexus Account' : 'Sign In to Nexus'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isSignUp
                  ? 'Register with your Google email.'
                  : 'Enter your credentials below.'}
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');

                if (lockoutUntil && Date.now() < lockoutUntil) {
                  const remaining = Math.ceil(
                    (lockoutUntil - Date.now()) / 1000
                  );
                  setAuthError(
                    `Security Lockout: Try again in ${remaining} seconds.`
                  );
                  return;
                } else if (lockoutUntil && Date.now() >= lockoutUntil) {
                  setLockoutUntil(null);
                  setFailedAttempts(0);
                }

                if (
                  !loginEmail.toLowerCase().endsWith('@gmail.com') &&
                  !loginEmail.toLowerCase().endsWith('@nexus.com')
                ) {
                  setAuthError(
                    'Security Protocol: Please use a valid @gmail.com or @nexus.com address.'
                  );
                  return;
                }

                if (isSignUp) {
                  const strongRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                  if (!strongRegex.test(loginPassword)) {
                    setAuthError(
                      'Weak Password: Must be 8+ chars with uppercase, lowercase, number, and special symbol (@$!%*?&).'
                    );
                    return;
                  }
                }

                const usersDB = JSON.parse(
                  localStorage.getItem('nexus_users') || '[]'
                );
                const hashedInputPassword = await hashPassword(loginPassword);
                const assignedRole =
                  loginEmail.toLowerCase() === 'admin@nexus.com'
                    ? 'admin'
                    : 'student';

                if (isSignUp) {
                  if (
                    usersDB.find((u) => u.email === loginEmail.toLowerCase())
                  ) {
                    setAuthError(
                      'This email is already registered. Please Sign In.'
                    );
                    return;
                  }
                  usersDB.push({
                    email: loginEmail.toLowerCase(),
                    password: hashedInputPassword,
                  });
                  localStorage.setItem('nexus_users', JSON.stringify(usersDB));
                  setUserRole(assignedRole);
                  setShowAuthModal(false);
                  setFailedAttempts(0);
                } else {
                  const user = usersDB.find(
                    (u) => u.email === loginEmail.toLowerCase()
                  );
                  if (!user) {
                    setAuthError('Account not found. Please Sign Up first.');
                    return;
                  }

                  if (user.password !== hashedInputPassword) {
                    const newAttempts = failedAttempts + 1;
                    setFailedAttempts(newAttempts);
                    if (newAttempts >= 3) {
                      setLockoutUntil(Date.now() + 30000);
                      setAuthError(
                        'Security Protocol: Too many failed attempts. Account locked for 30 seconds.'
                      );
                    } else {
                      setAuthError(
                        `Incorrect password. Attempt ${newAttempts} of 3.`
                      );
                    }
                    return;
                  }

                  setUserRole(assignedRole);
                  setShowAuthModal(false);
                  setFailedAttempts(0);
                }
              }}
              className="space-y-4"
            >
              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-medium">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@student.edu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] mt-2"
              >
                {isSignUp ? 'Register Account' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                  setLoginPassword('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SnippetHub({ snippets, setSnippets, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCode, setNewCode] = useState('');

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSnippet = (e) => {
    e.preventDefault();
    if (editingId) {
      setSnippets(
        snippets.map((s) =>
          s.id === editingId
            ? { ...s, title: newTitle, category: newCategory, code: newCode }
            : s
        )
      );
    } else {
      const newSnippet = {
        id: Date.now(),
        title: newTitle,
        category: newCategory,
        code: newCode,
      };
      setSnippets([newSnippet, ...snippets]);
    }
    handleCloseModal();
  };

  const openEditModal = (snippet) => {
    setEditingId(snippet.id);
    setNewTitle(snippet.title);
    setNewCategory(snippet.category);
    setNewCode(snippet.code);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewTitle('');
    setNewCategory('');
    setNewCode('');
  };

  const filtered = snippets.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Snippet Hub
            {isAdmin && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30 uppercase tracking-widest mt-1">
                Admin Mode
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">
            Public library of quick code utilities.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Snippet
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((snippet) => (
          <div
            key={snippet.id}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md mb-2 inline-block">
                  {snippet.category}
                </span>
                <h3 className="font-semibold text-slate-200">
                  {snippet.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => openEditModal(snippet)}
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    title="Edit Snippet"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleCopy(snippet.id, snippet.code)}
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedId === snippet.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <pre className="bg-[#0B0F19] p-3 rounded-lg text-sm text-slate-300 overflow-x-auto border border-slate-800">
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {}
      {showAddModal && isAdmin && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Snippet' : 'Create New Snippet'}
              </h2>
              <p className="text-sm text-slate-400">
                {editingId
                  ? 'Modify the existing code block.'
                  : 'Add a new code block to the public Hub.'}
              </p>
            </div>

            <form onSubmit={handleAddSnippet} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Snippet Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Center a Div"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category / Language
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. CSS, Python"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Code block
                </label>
                <textarea
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="// Type your code here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono h-40 resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  {editingId ? 'Save Changes' : 'Publish Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ArcadeLounge({ addMuMu }) {
  const [game, setGame] = useState('memory');

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Arcade Lounge</h2>
          <p className="text-slate-400 text-sm">
            Play games to earn MuMu points.
          </p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setGame('memory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              game === 'memory'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Memory Match
          </button>
          <button
            onClick={() => setGame('type')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              game === 'type'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Speed Typer
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {game === 'memory' ? (
          <MemoryMatch addMuMu={addMuMu} />
        ) : (
          <SpeedTyper addMuMu={addMuMu} />
        )}
      </div>
    </div>
  );
}

function MemoryMatch({ addMuMu }) {
  const icons = ['🌟', '🔥', '💎', '🚀', '🔮', '🧩'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...icons, ...icons].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            addMuMu(50);
            initGame();
          }, 1500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm text-slate-400 font-medium">Moves: {moves}</div>
        <div className="text-xs bg-fuchsia-500/20 text-fuchsia-300 px-2 py-1 rounded-lg border border-fuchsia-500/30">
          Win = +50 MuMu
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((icon, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
              flipped.includes(i) || matched.includes(i)
                ? 'bg-slate-700 scale-100'
                : 'bg-indigo-900/40 border border-indigo-500/20 hover:border-indigo-500/50 scale-100 hover:scale-105'
            }`}
          >
            {flipped.includes(i) || matched.includes(i) ? icon : ''}
          </button>
        ))}
      </div>
      {matched.length === cards.length && cards.length > 0 && (
        <div className="mt-6 text-center text-emerald-400 font-bold animate-bounce">
          You won 50 MuMu! Resetting...
        </div>
      )}
    </div>
  );
}

function SpeedTyper({ addMuMu }) {
  const sentence =
    'The quick brown fox jumps over the lazy dog in the futuristic neon city.';
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleInput = (e) => {
    if (finished) return;
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);

    if (val === sentence) {
      setFinished(true);
      const timeMin = (Date.now() - startTime) / 60000;
      const words = sentence.split(' ').length;
      const calculatedWpm = Math.round(words / timeMin);
      setWpm(calculatedWpm);
      addMuMu(calculatedWpm); // Earn WPM as MuMu
    }
  };

  const reset = () => {
    setInput('');
    setStartTime(null);
    setFinished(false);
    setWpm(0);
  };

  return (
    <div className="w-full max-w-2xl text-center">
      <div className="mb-6">
        <Trophy className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Cyber Speed Typer</h3>
        <p className="text-slate-400 text-sm mb-6">
          Type the text exactly to earn MuMu matching your WPM.
        </p>
        <div className="p-4 bg-slate-900 rounded-xl text-lg font-mono text-slate-300 select-none border border-slate-700">
          {sentence.split('').map((char, i) => {
            let color = 'text-slate-500';
            if (i < input.length) {
              color =
                input[i] === char
                  ? 'text-emerald-400'
                  : 'text-red-400 bg-red-900/30';
            }
            return (
              <span key={i} className={color}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
      <textarea
        value={input}
        onChange={handleInput}
        placeholder="Start typing here..."
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-white font-mono focus:border-indigo-500 focus:outline-none resize-none h-24 shadow-inner"
      />
      {finished && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="inline-flex flex-col items-center p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl">
            <div className="text-3xl font-black text-emerald-400 mb-1">
              {wpm} WPM
            </div>
            <div className="text-sm font-medium text-emerald-300">
              +{wpm} MuMu Added to Vault!
            </div>
            <button
              onClick={reset}
              className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white px-4 py-2 bg-slate-800 rounded-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FutureLab() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-center py-20">
      <FlaskConical className="w-16 h-16 text-slate-600 mx-auto mb-6" />
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
        Future Module Lab
      </h2>
      <p className="text-slate-400 text-lg mb-8">
        This area is under active development. Upcoming features include live
        collaboration rooms, Firebase data syncing, and customizable themes.
      </p>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-left">
        <h3 className="font-semibold text-white mb-2">Got a feature idea?</h3>
        <textarea
          placeholder="Drop your feedback for the Nexus team..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white resize-none h-24 mb-3 focus:border-indigo-500 focus:outline-none"
        />
        <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">
          Submit Locally
        </button>
      </div>
    </div>
  );
}

function AuraChat() {
  const [messages, setMessages] = useState([
    {
      sender: 'aura',
      text: "I'm Aura, your AI tutor for Nexus Studio. Note: I specialize in code, logic, and planning. I do not generate images or videos. Attach context if needed!",
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'image',
            name: file.name,
            icon: ImageIcon,
            mimeType: file.type,
            base64: base64String,
          },
        ]);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachments((prev) => [
        ...prev,
        { id: Date.now(), type: 'pdf', name: file.name, icon: FileText },
      ]);
    }
    e.target.value = '';
  };

  const handleAttachLink = () => {
    const link = prompt('Enter link URL:');
    if (link) {
      setAttachments((prev) => [
        ...prev,
        { id: Date.now(), type: 'link', name: link, icon: Link, url: link },
      ]);
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() && attachments.length === 0) return;
    if (isAiLoading) return;

    let userContent = inputMsg;
    if (attachments.length > 0) {
      userContent += `\n[Attached: ${attachments
        .map((a) => a.name)
        .join(', ')}]`;
    }

    const updatedMsgs = [...messages, { sender: 'user', text: userContent }];
    setMessages(updatedMsgs);
    const currentInput = inputMsg;
    const currentAttachments = [...attachments];

    setInputMsg('');
    setAttachments([]);
    setIsAiLoading(true);

    try {
      const chatHistory = updatedMsgs.slice(0, -1).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const newParts = [
        { text: currentInput || 'Analyze the attached files.' },
      ];
      currentAttachments.forEach((att) => {
        if (att.type === 'image' && att.base64) {
          newParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.base64,
            },
          });
        }
      });
      chatHistory.push({ role: 'user', parts: newParts });

      const apiKey = ''; // Canvas handles API Key automatically
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: chatHistory,
        systemInstruction: {
          parts: [
            {
              text: 'You are Aura, an AI coding tutor for Nexus Studio. You specialize in software development, computer science, and debugging. You cannot generate images or videos; politely decline if asked. Format all code snippets strictly using markdown triple backticks with the language specified (e.g. ```javascript).',
            },
          ],
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        setMessages([...updatedMsgs, { sender: 'aura', text: aiText }]);
      } else {
        throw new Error('Invalid response from AI.');
      }
    } catch (err) {
      setMessages([
        ...updatedMsgs,
        {
          sender: 'aura',
          text: `System Alert: Aura encountered an error. (${err.message})`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    const blockRegex = /(```[\s\S]*?```)/g;
    const parts = text.split(blockRegex);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.split('\n');
        const firstLine = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');

        return (
          <div
            key={index}
            className="my-4 bg-[#0B0F19] rounded-xl border border-slate-700 overflow-hidden shadow-sm"
          >
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                {firstLine || 'CODE'}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors p-1"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 max-w-4xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                  : 'bg-emerald-900/50 border border-emerald-500/30'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div
              className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm w-full'
              }`}
            >
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {isAiLoading && (
          <div className="flex items-end gap-3 max-w-3xl mr-auto">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl rounded-bl-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium tracking-wide">
                Aura is generating code...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md">
        {attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3 px-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 shadow-sm animate-in zoom-in duration-200"
              >
                <att.icon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="max-w-[150px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="text-slate-400 hover:text-red-400 ml-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500/50 focus-within:bg-slate-800 transition-all shadow-inner"
        >
          <div className="flex gap-1 p-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-colors"
              title="Attach File / Image"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleAttachLink}
              className="p-2.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-colors hidden sm:block"
              title="Attach Link"
            >
              <Link className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask Aura to generate a React component or analyze an image..."
            className="flex-1 max-h-40 min-h-[44px] bg-transparent resize-none outline-none text-white placeholder:text-slate-500 px-2 py-3 text-[15px] custom-scrollbar"
            rows={1}
          />
          <button
            type="submit"
            disabled={
              (!inputMsg.trim() && attachments.length === 0) || isAiLoading
            }
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5 shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function StudyPlanner() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <CalendarDays className="w-6 h-6 text-indigo-400" /> AI Study Planner
      </h2>
      <p className="text-slate-400 text-sm mb-8">
        Generate customized learning roadmaps with curated YouTube search links.
      </p>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          What do you want to learn?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Advanced Data Structures in Python"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
          />
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Generate
          </button>
        </div>
      </div>

      <div className="opacity-50 pointer-events-none p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center">
        <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <div className="text-slate-400">
          Roadmap generation UI preview.
          <br />
          Hook this up to Gemini API to populate dynamically.
        </div>
      </div>
    </div>
  );
}

function RoutinePacker() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Backpack className="w-6 h-6 text-emerald-400" /> AI Routine & Bag
        Packer
      </h2>
      <p className="text-slate-400 text-sm mb-8">
        Paste your daily timetable, and AI will generate a packing checklist for
        your bag.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Today's Timetable / Classes
          </label>
          <textarea
            placeholder="Math 101, Physics Lab, Gym..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white resize-none h-40 focus:outline-none focus:border-emerald-500 mb-4"
          />
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors">
            Scan & Pack Bag
          </button>
        </div>

        <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center text-center opacity-50">
          <Check className="w-8 h-8 text-slate-500 mb-3" />
          <div className="text-slate-400 text-sm">
            Your packing checklist will appear here.
            <br />
            Ready for Gemini analysis.
          </div>
        </div>
      </div>
    </div>
  );
}

function MuMuVault({ balance }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-fuchsia-900/20 to-slate-900 rounded-3xl border border-fuchsia-500/20 mb-8">
        <Gem className="w-16 h-16 text-fuchsia-400 mb-4 drop-shadow-[0_0_25px_rgba(232,121,249,0.5)]" />
        <h2 className="text-5xl font-black text-white tracking-tight mb-2">
          {balance}
        </h2>
        <div className="text-fuchsia-400 font-bold tracking-widest uppercase">
          Total MuMu Balance
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-4">How to Earn</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center">
          <Gamepad2 className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <div className="font-semibold text-white mb-1">Play Arcade</div>
          <p className="text-xs text-slate-400">
            Win Memory Match or Speed Typer to rack up points.
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center">
          <CalendarDays className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <div className="font-semibold text-white mb-1">Study Goals</div>
          <p className="text-xs text-slate-400">
            Complete AI-generated roadmaps (Coming Soon).
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center opacity-50">
          <UsersIcon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <div className="font-semibold text-white mb-1">Referrals</div>
          <p className="text-xs text-slate-400">
            Invite classmates to Nexus (Coming Soon).
          </p>
        </div>
      </div>
    </div>
  );
}

function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
