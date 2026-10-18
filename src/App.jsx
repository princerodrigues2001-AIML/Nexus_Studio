import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sparkles, Terminal, Code, Cpu, Trophy, User, 
  LogIn, Lock, Menu, X, LogOut, Plus, Search, Send, Play, 
  CheckSquare, Briefcase, Trash2, Edit2, Copy, Check, 
  Key, Zap, Grid, Bug, RotateCcw
} from 'lucide-react';

export default function App() {
  // --- PERSISTENT STATES ---
  const [userRole, setUserRole] = useState(() => localStorage.getItem('nexus_user_role') || 'guest');
  const [mumuPoints, setMumuPoints] = useState(() => parseInt(localStorage.getItem('nexus_mumu_points')) || 0);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('nexus_gemini_key') || '');

  const [snippets, setSnippets] = useState(() => {
    const saved = localStorage.getItem('nexus_snippets');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Center a Div', category: 'CSS', code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
      { id: 2, title: 'Fetch API Wrapper', category: 'JS', code: 'const fetcher = url => fetch(url).then(r => r.json());' },
      { id: 3, title: 'React State Hook', category: 'REACT', code: 'const [val, setVal] = useState(initial);' }
    ];
  });

  // --- UI & NAVIGATION STATES ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('nexus_active_tab') || 'snippetHub');
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState(null);

  // --- LOGIN STATES ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- SNIPPET MODAL STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCategory, setSnippetCategory] = useState('JS');
  const [snippetCode, setSnippetCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // --- AURA AI STATES ---
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(customApiKey);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'aura', text: 'Hello Prince! I am Aura, your AI coding and study partner. Ask me about React, JavaScript, Python, CSS, or your study schedule!' }
  ]);
  const chatEndRef = useRef(null);

  // --- ARCADE GAME STATES ---
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'typer' | 'ttt' | 'bug'
  
  // Game 1: Memory Match
  const memoryIcons = ['⚡', '🚀', '💻', '🔥', '⚡', '🚀', '💻', '🔥'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);

  // Game 2: Speed Typer
  const codeWords = ['useState', 'useEffect', 'function', 'Promise', 'async', 'tailwind', 'component', 'database', 'interface', 'variable'];
  const [targetWord, setTargetWord] = useState('useState');
  const [typedWord, setTypedWord] = useState('');
  const [typerStreak, setTyperStreak] = useState(0);

  // Game 3: Tic-Tac-Toe
  const [board, setBoard] = useState(Array(9).fill(null));
  const [tttStatus, setTttStatus] = useState('Your turn (X)');

  // Game 4: Bug Squasher
  const [bugPos, setBugPos] = useState(4);
  const [bugsSquashed, setBugsSquashed] = useState(0);

  // --- STUDY PLANNER & BAG PACKER STATES ---
  const [studyTasks, setStudyTasks] = useState(() => {
    const saved = localStorage.getItem('nexus_study_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review React Hooks & State', done: false },
      { id: 2, text: 'Practice Data Structures', done: true }
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');

  const [bagItems, setBagItems] = useState(() => {
    const saved = localStorage.getItem('nexus_bag_items');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Laptop & Charger', packed: true },
      { id: 2, text: 'Notebook & ID Card', packed: false }
    ];
  });
  const [newBagItem, setNewBagItem] = useState('');

  // --- SYNC TO LOCAL STORAGE ---
  useEffect(() => localStorage.setItem('nexus_user_role', userRole), [userRole]);
  useEffect(() => localStorage.setItem('nexus_mumu_points', mumuPoints), [mumuPoints]);
  useEffect(() => localStorage.setItem('nexus_snippets', JSON.stringify(snippets)), [snippets]);
  useEffect(() => localStorage.setItem('nexus_active_tab', activeTab), [activeTab]);
  useEffect(() => localStorage.setItem('nexus_study_tasks', JSON.stringify(studyTasks)), [studyTasks]);
  useEffect(() => localStorage.setItem('nexus_bag_items', JSON.stringify(bagItems)), [bagItems]);
  useEffect(() => localStorage.setItem('nexus_gemini_key', customApiKey), [customApiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  // --- TOAST NOTIFICATION HELPER ---
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const awardPoints = (amount, label = 'Bonus') => {
    setMumuPoints((prev) => prev + amount);
    showToast(`+${amount} MuMu Points! (${label})`);
  };

  // --- AUTH & NAVIGATION HANDLERS ---
  const handleNavigation = (tab) => {
    if (userRole === 'guest' && tab !== 'snippetHub' && tab !== 'arcadeLounge') {
      setShowLogin(true);
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail.trim() === 'admin@nexus.com' && loginPassword === 'admin123') {
      setUserRole('admin');
      setShowLogin(false);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      showToast('Welcome back, Nexus Admin!');
    } else {
      setLoginError('Invalid credentials. Use admin@nexus.com / admin123');
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setActiveTab('snippetHub');
    setIsMobileMenuOpen(false);
    showToast('Logged out safely.');
  };

  // --- SNIPPET HANDLERS ---
  const openAddSnippetModal = () => {
    setEditingSnippet(null);
    setSnippetTitle('');
    setSnippetCategory('JS');
    setSnippetCode('');
    setShowSnippetModal(true);
  };

  const openEditSnippetModal = (snippet) => {
    setEditingSnippet(snippet);
    setSnippetTitle(snippet.title);
    setSnippetCategory(snippet.category || 'JS');
    setSnippetCode(snippet.code);
    setShowSnippetModal(true);
  };

  const handleSaveSnippet = (e) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetCode.trim()) return;

    if (editingSnippet) {
      setSnippets(snippets.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, title: snippetTitle, category: snippetCategory, code: snippetCode }
          : s
      ));
      showToast('✨ Snippet updated with changes!');
    } else {
      const newSnippet = {
        id: Date.now(),
        title: snippetTitle,
        category: snippetCategory,
        code: snippetCode
      };
      setSnippets([newSnippet, ...snippets]);
      showToast('🚀 New snippet added to Hub!');
    }
    setShowSnippetModal(false);
  };

  const handleDeleteSnippet = (id) => {
    setSnippets(snippets.filter(s => s.id !== id));
    showToast('🗑️ Snippet removed.');
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast('📋 Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- AURA AI HANDLER (GEMINI API + SMART BUILT-IN ENGINE) ---
  const getSmartLocalReply = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hey Prince! I'm online and ready to help. Ask me to write code, explain React concepts, or help plan your studies!";
    }
    if (lower.includes('react') || lower.includes('hook') || lower.includes('state')) {
      return "In React, `useState` stores dynamic values and `useEffect` runs side effects (like saving to localStorage or fetching from Firebase).\n\nExample:\nconst [count, setCount] = useState(0);";
    }
    if (lower.includes('center') || lower.includes('css') || lower.includes('flex')) {
      return "Here is the cleanest way to center anything in CSS:\n\ndisplay: flex;\njustify-content: center;\nalign-items: center;";
    }
    if (lower.includes('python')) {
      return "Python is awesome for AI and backend logic! Here's a quick list comprehension example:\n\nsquares = [x**2 for x in range(10)]";
    }
    if (lower.includes('firebase') || lower.includes('sync') || lower.includes('database')) {
      return "To sync data across your laptop and phone in real time, we use Firebase Firestore's `onSnapshot` listener so every device updates automatically!";
    }
    if (lower.includes('study') || lower.includes('exam') || lower.includes('focus')) {
      return "Try the 45/15 Pomodoro method: Code or study intensely for 45 minutes with zero phone distractions, then take a 15-minute Arcade break!";
    }
    return `Here is a quick breakdown for "${msg}":\n1. Break the problem into smaller components.\n2. Test your state updates step-by-step.\n\n(Tip: Click the 🔑 API Key button in the top-right to connect your live Gemini key for unlimited deep AI answers!)`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage || isAiLoading) return;

    const updatedHistory = [...chatHistory, { sender: 'user', text: userMessage }];
    setChatHistory(updatedHistory);
    setChatInput('');
    setIsAiLoading(true);

    const activeKey = customApiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY;

    if (activeKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userMessage }] }]
            })
          }
        );
        const data = await response.json();
        const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiReply) {
          setChatHistory([...updatedHistory, { sender: 'aura', text: aiReply }]);
          setIsAiLoading(false);
          return;
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    }

    setTimeout(() => {
      setChatHistory([...updatedHistory, { sender: 'aura', text: getSmartLocalReply(userMessage) }]);
      setIsAiLoading(false);
    }, 500);
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setCustomApiKey(tempKeyInput.trim());
    setShowKeyModal(false);
    showToast('🔑 Gemini API Key saved!');
  };

  // --- ARCADE GAMES LOGIC ---
  // 1. Memory Match
  const initMemoryGame = () => {
    const shuffled = [...memoryIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setActiveGame('memory');
  };

  const handleCardClick = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || solved.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        const newSolved = [...solved, first, second];
        setSolved(newSolved);
        setFlipped([]);
        if (newSolved.length === cards.length) {
          awardPoints(25, 'Memory Master');
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  // 2. Speed Typer
  const initTyperGame = () => {
    setTargetWord(codeWords[Math.floor(Math.random() * codeWords.length)]);
    setTypedWord('');
    setTyperStreak(0);
    setActiveGame('typer');
  };

  const handleTyperChange = (e) => {
    const val = e.target.value;
    setTypedWord(val);
    if (val === targetWord) {
      awardPoints(15, 'Speed Coder');
      setTyperStreak((s) => s + 1);
      setTypedWord('');
      setTargetWord(codeWords[Math.floor(Math.random() * codeWords.length)]);
    }
  };

  // 3. Tic-Tac-Toe
  const checkWinner = (sq) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a,b,c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
    }
    return sq.includes(null) ? null : 'Draw';
  };

  const initTttGame = () => {
    setBoard(Array(9).fill(null));
    setTttStatus('Your turn (X)');
    setActiveGame('ttt');
  };

  const handleTttClick = (idx) => {
    if (board[idx] || checkWinner(board)) return;
    const next = [...board];
    next[idx] = 'X';
    setBoard(next);

    const win = checkWinner(next);
    if (win) {
      if (win === 'X') awardPoints(30, 'Tic-Tac-Toe Win');
      setTttStatus(win === 'Draw' ? "It's a Draw!" : `${win} Wins!`);
      return;
    }

    setTttStatus('AI thinking...');
    setTimeout(() => {
      const empty = next.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (empty.length > 0) {
        const aiMove = empty[Math.floor(Math.random() * empty.length)];
        next[aiMove] = 'O';
        setBoard([...next]);
        const aiWin = checkWinner(next);
        if (aiWin) {
          setTttStatus(aiWin === 'Draw' ? "It's a Draw!" : `${aiWin} Wins!`);
        } else {
          setTttStatus('Your turn (X)');
        }
      }
    }, 350);
  };

  // 4. Bug Squasher
  const initBugGame = () => {
    setBugsSquashed(0);
    setBugPos(Math.floor(Math.random() * 9));
    setActiveGame('bug');
  };

  const handleSquashBug = (idx) => {
    if (idx === bugPos) {
      const nextCount = bugsSquashed + 1;
      setBugsSquashed(nextCount);
      let nextPos = Math.floor(Math.random() * 9);
      while (nextPos === bugPos) nextPos = Math.floor(Math.random() * 9);
      setBugPos(nextPos);
      if (nextCount % 5 === 0) {
        awardPoints(20, 'Bug Hunter');
      }
    }
  };

  // --- STUDY & BAG HANDLERS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setStudyTasks([...studyTasks, { id: Date.now(), text: newTaskText, done: false }]);
    setNewTaskText('');
    showToast('✅ Study goal added!');
  };

  const handleAddBagItem = (e) => {
    e.preventDefault();
    if (!newBagItem.trim()) return;
    setBagItems([...bagItems, { id: Date.now(), text: newBagItem, packed: false }]);
    setNewBagItem('');
    showToast('🎒 Item added to bag list!');
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- PAGE RENDERER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'snippetHub':
        return (
          <div className="p-4 md:p-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                    Snippet Hub
                  </h1>
                  {userRole === 'admin' && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                      Admin Mode
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">Public library of animated quick code utilities.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search snippets..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                {userRole === 'admin' && (
                  <button 
                    onClick={openAddSnippetModal}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shrink-0 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" /> Add Snippet
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet, index) => (
                <div 
                  key={snippet.id} 
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="animate-fade-up bg-[#12121a] p-5 rounded-xl border border-white/10 hover:border-indigo-500/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                      {snippet.category || 'CODE'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleCopyCode(snippet.id, snippet.code)}
                        className="p-1.5 text-gray-400 hover:text-white rounded bg-white/5 hover:bg-white/10 hover:scale-110 transition-all"
                        title="Copy Code"
                      >
                        {copiedId === snippet.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button 
                            onClick={() => openEditSnippetModal(snippet)}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 rounded bg-white/5 hover:bg-white/10 hover:scale-110 transition-all"
                            title="Edit Snippet"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSnippet(snippet.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded bg-white/5 hover:bg-white/10 hover:scale-110 transition-all"
                            title="Delete Snippet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">{snippet.title}</h3>
                  <pre className="bg-[#050505] p-4 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap flex-1 border border-white/5">
                    {snippet.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        );

      case 'arcadeLounge':
        return (
          <div className="p-4 md:p-8 animate-fade-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Arcade Lounge</h1>
                <p className="text-gray-400 text-sm">Play interactive cyber mini-games to earn MuMu points.</p>
              </div>
              {activeGame && (
                <button 
                  onClick={() => setActiveGame(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  ← Back to All Games
                </button>
              )}
            </div>

            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game 1 Card */}
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 hover:border-pink-500/50 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <Cpu className="w-12 h-12 text-pink-500 mb-3 animate-bounce" />
                  <h3 className="text-xl font-bold mb-1">Memory Match</h3>
                  <p className="text-gray-400 text-sm mb-5">Flip cards and match all cyber pairs.</p>
                  <button onClick={initMemoryGame} className="mt-auto bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-pink-600/20">
                    Launch Game (+25 MuMu)
                  </button>
                </div>

                {/* Game 2 Card */}
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <Terminal className="w-12 h-12 text-emerald-500 mb-3 animate-pulse" />
                  <h3 className="text-xl font-bold mb-1">Speed Typer</h3>
                  <p className="text-gray-400 text-sm mb-5">Type React & JS keywords at lightning speed.</p>
                  <button onClick={initTyperGame} className="mt-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-600/20">
                    Launch Game (+15 MuMu)
                  </button>
                </div>

                {/* Game 3 Card */}
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <Grid className="w-12 h-12 text-indigo-400 mb-3" />
                  <h3 className="text-xl font-bold mb-1">Cyber Tic-Tac-Toe</h3>
                  <p className="text-gray-400 text-sm mb-5">Outsmart the Nexus AI in a 3x3 grid duel.</p>
                  <button onClick={initTttGame} className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-600/20">
                    Launch Game (+30 MuMu)
                  </button>
                </div>

                {/* Game 4 Card */}
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 hover:border-orange-500/50 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <Bug className="w-12 h-12 text-orange-500 mb-3 animate-bounce" />
                  <h3 className="text-xl font-bold mb-1">Bug Squasher</h3>
                  <p className="text-gray-400 text-sm mb-5">Test your reflexes! Squash 5 bugs for bonus points.</p>
                  <button onClick={initBugGame} className="mt-auto bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-orange-600/20">
                    Launch Game (+20 MuMu)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] p-6 md:p-8 rounded-2xl border border-white/10 max-w-lg mx-auto text-center animate-pop-in">
                {/* PLAYABLE GAME 1: MEMORY MATCH */}
                {activeGame === 'memory' && (
                  <div>
                    <h2 className="text-xl font-bold text-pink-400 mb-4">Memory Match</h2>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {cards.map((card, idx) => {
                        const isShown = flipped.includes(idx) || solved.includes(idx);
                        return (
                          <button
                            key={card.id}
                            onClick={() => handleCardClick(idx)}
                            className={`h-20 rounded-xl text-2xl flex items-center justify-center transition-all duration-300 ${
                              isShown ? 'bg-pink-600/30 border-2 border-pink-500 scale-105' : 'bg-[#050505] border border-white/10 hover:border-pink-500/40'
                            }`}
                          >
                            {isShown ? card.icon : '❓'}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={initMemoryGame} className="bg-pink-600 hover:bg-pink-500 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto">
                      <RotateCcw className="w-4 h-4" /> Shuffle Again
                    </button>
                  </div>
                )}

                {/* PLAYABLE GAME 2: SPEED TYPER */}
                {activeGame === 'typer' && (
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-2">Mainframe Speed Typer</h2>
                    <p className="text-xs text-gray-400 mb-4">Streak: {typerStreak} words</p>
                    <div className="bg-[#050505] py-5 px-6 rounded-xl border border-emerald-500/30 font-mono text-2xl font-bold text-emerald-400 mb-4 tracking-wider">
                      {targetWord}
                    </div>
                    <input
                      type="text"
                      value={typedWord}
                      onChange={handleTyperChange}
                      placeholder="Type the exact word above..."
                      autoFocus
                      className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-center text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* PLAYABLE GAME 3: TIC TAC TOE */}
                {activeGame === 'ttt' && (
                  <div>
                    <h2 className="text-xl font-bold text-indigo-400 mb-2">Cyber Tic-Tac-Toe</h2>
                    <p className="text-sm text-gray-300 mb-4">{tttStatus}</p>
                    <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
                      {board.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTttClick(idx)}
                          className="h-20 bg-[#050505] border border-white/10 hover:border-indigo-500 rounded-xl text-2xl font-bold flex items-center justify-center transition-all"
                        >
                          <span className={cell === 'X' ? 'text-indigo-400' : 'text-pink-400'}>{cell}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={initTttGame} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto">
                      <RotateCcw className="w-4 h-4" /> Reset Board
                    </button>
                  </div>
                )}

                {/* PLAYABLE GAME 4: BUG SQUASHER */}
                {activeGame === 'bug' && (
                  <div>
                    <h2 className="text-xl font-bold text-orange-400 mb-1">Bug Squasher</h2>
                    <p className="text-xs text-gray-400 mb-4">Bugs Squashed: {bugsSquashed} (Every 5 = +20 MuMu)</p>
                    <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-4">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSquashBug(idx)}
                          className={`h-20 rounded-xl border flex items-center justify-center text-2xl transition-all ${
                            bugPos === idx ? 'bg-orange-500/20 border-orange-500 scale-105' : 'bg-[#050505] border-white/10'
                          }`}
                        >
                          {bugPos === idx ? '🐞' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'auraBot':
        return (
          <div className="flex flex-col h-full animate-fade-up">
            <div className="p-4 md:p-6 border-b border-white/10 bg-[#0a0a0f] flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-pulse" /> Aura AI Tutor
              </h1>
              <button 
                onClick={() => { setTempKeyInput(customApiKey); setShowKeyModal(true); }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 text-gray-300 hover:text-white transition-all"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                {customApiKey || import.meta.env.VITE_GEMINI_API_KEY ? 'API Key Active' : 'Set Gemini Key'}
              </button>
            </div>
            
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 animate-fade-up ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#12121a] border border-white/10 text-gray-200 rounded-tl-none'}`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-[#12121a] border border-white/10 text-gray-400 p-4 rounded-2xl rounded-tl-none text-sm">
                    Aura is generating response...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0f]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Aura about React, JS, Python, or study tips..." 
                  className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-50 px-4 py-3 rounded-lg transition-all shrink-0 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </div>
        );

      case 'studyPlanner':
        return (
          <div className="p-4 md:p-8 max-w-3xl animate-fade-up">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Study Planner</h1>
            <p className="text-gray-400 text-sm mb-6">Track your learning milestones and daily goals.</p>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new study goal..."
                className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-lg text-sm font-bold transition-all">
                Add Goal
              </button>
            </form>
            <div className="space-y-3">
              {studyTasks.map(task => (
                <div key={task.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStudyTasks(studyTasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}>
                    <input type="checkbox" checked={task.done} readOnly className="w-4 h-4 accent-emerald-500" />
                    <span className={task.done ? 'line-through text-gray-500' : 'text-white'}>{task.text}</span>
                  </div>
                  <button onClick={() => setStudyTasks(studyTasks.filter(t => t.id !== task.id))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bagPacker':
        return (
          <div className="p-4 md:p-8 max-w-3xl animate-fade-up">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Routine & Bag Packer</h1>
            <p className="text-gray-400 text-sm mb-6">Never forget your college or hackathon essentials.</p>
            <form onSubmit={handleAddBagItem} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newBagItem}
                onChange={(e) => setNewBagItem(e.target.value)}
                placeholder="Add item to pack..."
                className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-lg text-sm font-bold transition-all">
                Add Item
              </button>
            </form>
            <div className="space-y-3">
              {bagItems.map(item => (
                <div key={item.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 hover:border-orange-500/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setBagItems(bagItems.map(b => b.id === item.id ? { ...b, packed: !b.packed } : b))}>
                    <input type="checkbox" checked={item.packed} readOnly className="w-4 h-4 accent-orange-500" />
                    <span className={item.packed ? 'line-through text-gray-500' : 'text-white'}>{item.text}</span>
                  </div>
                  <button onClick={() => setBagItems(bagItems.filter(b => b.id !== item.id))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans relative">
      {/* CUSTOM KEYFRAME ANIMATIONS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-up { animation: fadeInUp 0.35s ease-out forwards; }
        .animate-pop-in { animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* ANIMATED TOAST BANNER */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-400/40 flex items-center gap-2 text-sm font-semibold animate-pop-in">
          <Zap className="w-4 h-4 text-yellow-300" /> {toast}
        </div>
      )}

      {/* 1. MOBILE TOP HEADER */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="font-bold text-lg text-indigo-400 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Nexus Studio
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {mumuPoints}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-white hover:text-indigo-400">
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 2. MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* 3. RESPONSIVE SIDEBAR */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tight">NEXUS</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Studio OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <div className="text-xs font-bold text-gray-600 uppercase mb-4 px-3">Public Access</div>
          
          <button onClick={() => handleNavigation('snippetHub')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'snippetHub' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Code className="w-5 h-5" /> Snippet Hub
          </button>
          
          <button onClick={() => handleNavigation('arcadeLounge')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'arcadeLounge' ? 'bg-pink-600/10 text-pink-400 border border-pink-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Play className="w-5 h-5" /> Arcade Lounge
          </button>

          <div className="text-xs font-bold text-gray-600 uppercase mb-4 mt-8 px-3">Restricted Access</div>

          <button onClick={() => handleNavigation('auraBot')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'auraBot' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> Aura AI Bot</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>

          <button onClick={() => handleNavigation('studyPlanner')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'studyPlanner' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><CheckSquare className="w-5 h-5" /> AI Study Planner</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>

          <button onClick={() => handleNavigation('bagPacker')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'bagPacker' ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> Routine & Packer</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#050505]/50">
          <div className="hidden md:flex bg-[#12121a] rounded-lg p-3 items-center justify-between mb-4 border border-white/5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-gray-300">MuMu Vault</span>
            </div>
            <span className="text-yellow-500 font-mono text-sm">{mumuPoints}</span>
          </div>

          {userRole === 'guest' ? (
            <button onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg transition-all text-sm font-bold shadow-lg shadow-indigo-600/20">
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
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Authenticated</div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-y-auto overflow-x-hidden relative bg-[#050505]">
        {renderContent()}
      </div>

      {/* --- ADD / EDIT SNIPPET MODAL (WITH ANIMATION) --- */}
      {showSnippetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowSnippetModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {editingSnippet ? 'Edit Snippet' : 'Add New Snippet'}
            </h2>
            <form onSubmit={handleSaveSnippet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="e.g., Center a Div"
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Language / Category</label>
                <select
                  value={snippetCategory}
                  onChange={(e) => setSnippetCategory(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="JS">JavaScript (JS)</option>
                  <option value="REACT">React</option>
                  <option value="CSS">CSS</option>
                  <option value="HTML">HTML</option>
                  <option value="PYTHON">Python</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code</label>
                <textarea
                  rows={5}
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSnippetModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all">
                  {editingSnippet ? 'Save Changes' : 'Create Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GEMINI API KEY MODAL --- */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-indigo-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowKeyModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" /> Set Gemini API Key
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Paste your Gemini API key below to unlock live AI responses right in your browser.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowKeyModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SECURE LOGIN MODAL --- */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-500/50">
                <Shield className="w-7 h-7 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Secure Access</h2>
              <p className="text-gray-400 text-xs mt-1">Login stays active across page reloads</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm" placeholder="admin@nexus.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm" placeholder="••••••••" required />
              </div>
              {loginError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs text-center p-3 rounded-lg">{loginError}</div>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-bold transition-all">
                Initialize Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}