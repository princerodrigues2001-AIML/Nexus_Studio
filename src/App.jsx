import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sparkles, Terminal, Code, Cpu, Trophy, User, 
  LogIn, Lock, Menu, X, LogOut, Plus, Search, Send, Play, 
  CheckSquare, Briefcase, Trash2, Edit2, Copy, Check, 
  Zap, Grid, RotateCcw, Paperclip, Cloud, CloudOff,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Brain
} from 'lucide-react';

// Reads securely from Vercel Environment Variables so GitHub Push Protection never blocks it
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const FIREBASE_DB_URL = import.meta.env.VITE_FIREBASE_DB_URL || "";

const DEFAULT_SNIPPETS = [
  { id: 1, title: 'Center a Div', category: 'CSS', code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
  { id: 2, title: 'Fetch API Wrapper', category: 'JS', code: 'const fetcher = url => fetch(url).then(r => r.json());' },
  { id: 3, title: 'React State Hook', category: 'REACT', code: 'const [val, setVal] = useState(initial);' }
];

const DEFAULT_TASKS = [
  { id: 1, text: 'Review React Hooks & State', done: false },
  { id: 2, text: 'Practice Data Structures & Algorithms', done: true }
];

const DEFAULT_BAG = [
  { id: 1, text: 'Laptop & Charger', packed: true },
  { id: 2, text: 'College ID & Notebook', packed: false }
];

const CODELE_WORDS = [
  'REACT', 'LOGIC', 'CYBER', 'STACK', 'PIXEL', 
  'ARRAY', 'DEBUG', 'CLOUD', 'TOKEN', 'NEXUS', 
  'ASYNC', 'FETCH', 'STATE', 'NODES', 'SMART'
];

const STROOP_COLORS = [
  { name: 'RED', hex: '#ef4444', bg: 'bg-red-500 hover:bg-red-400' },
  { name: 'BLUE', hex: '#3b82f6', bg: 'bg-blue-500 hover:bg-blue-400' },
  { name: 'GREEN', hex: '#10b981', bg: 'bg-emerald-500 hover:bg-emerald-400' },
  { name: 'YELLOW', hex: '#eab308', bg: 'bg-yellow-500 hover:bg-yellow-400' }
];

export default function App() {
  // --- AUTH & NAVIGATION STATES ---
  const [userRole, setUserRole] = useState(() => localStorage.getItem('nexus_user_role') || 'guest');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('nexus_active_tab') || 'snippetHub');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(false);

  // --- SYNCED DATA STATES ---
  const [mumuPoints, setMumuPoints] = useState(() => parseInt(localStorage.getItem('nexus_mumu_points')) || 0);
  const [snippets, setSnippets] = useState(() => {
    const saved = localStorage.getItem('nexus_snippets');
    return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
  });
  const [studyTasks, setStudyTasks] = useState(() => {
    const saved = localStorage.getItem('nexus_study_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
  const [bagItems, setBagItems] = useState(() => {
    const saved = localStorage.getItem('nexus_bag_items');
    return saved ? JSON.parse(saved) : DEFAULT_BAG;
  });

  // --- LOGIN FORM STATES ---
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { 
      sender: 'aura', 
      text: "Hey Prince! 👋 I'm Aura, your friendly AI buddy and coding partner. Say hi, ask me anything about code or studies, or click the paperclip icon (📎) to share an image with me!" 
    }
  ]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- STUDY & BAG INPUTS ---
  const [newTaskText, setNewTaskText] = useState('');
  const [newBagItem, setNewBagItem] = useState('');

  // --- ARCADE GEN-Z LOGIC GAMES STATES ---
  const [activeGame, setActiveGame] = useState(null);

  // Game 1: CODELE
  const [codeleTarget, setCodeleTarget] = useState('REACT');
  const [codeleGuesses, setCodeleGuesses] = useState([]);
  const [codeleCurrent, setCodeleCurrent] = useState('');
  const [codeleStatus, setCodeleStatus] = useState('playing');

  // Game 2: 2048 Cyber Merge
  const [grid2048, setGrid2048] = useState(Array(16).fill(0));
  const [score2048, setScore2048] = useState(0);

  // Game 3: Quantum Lights Out
  const [lightsGrid, setLightsGrid] = useState(Array(16).fill(false));
  const [lightsMoves, setLightsMoves] = useState(0);

  // Game 4: Stroop Mind Paradox
  const [stroopWordIdx, setStroopWordIdx] = useState(0);
  const [stroopColorIdx, setStroopColorIdx] = useState(1);
  const [stroopMode, setStroopMode] = useState('COLOR');
  const [stroopStreak, setStroopStreak] = useState(0);

  // --- FIREBASE CLOUD SYNC ENGINE ---
  const isFirebaseConfigured = Boolean(
    FIREBASE_DB_URL && FIREBASE_DB_URL.startsWith('https://')
  );
  const cleanDbUrl = isFirebaseConfigured ? FIREBASE_DB_URL.replace(/\/$/, '') : '';

  const pushToCloud = async (nextData) => {
    if (!isFirebaseConfigured) return;
    try {
      await fetch(`${cleanDbUrl}/nexus_studio_state.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snippets: nextData.snippets ?? snippets,
          studyTasks: nextData.studyTasks ?? studyTasks,
          bagItems: nextData.bagItems ?? bagItems,
          mumuPoints: nextData.mumuPoints ?? mumuPoints,
          updatedAt: Date.now()
        })
      });
      setCloudConnected(true);
    } catch (err) {
      setCloudConnected(false);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const fetchFromCloud = async () => {
      try {
        const res = await fetch(`${cleanDbUrl}/nexus_studio_state.json`);
        if (!res.ok) return;
        const data = await res.json();
        setCloudConnected(true);

        if (data) {
          if (Array.isArray(data.snippets)) {
            setSnippets(data.snippets);
            localStorage.setItem('nexus_snippets', JSON.stringify(data.snippets));
          }
          if (Array.isArray(data.studyTasks)) {
            setStudyTasks(data.studyTasks);
            localStorage.setItem('nexus_study_tasks', JSON.stringify(data.studyTasks));
          }
          if (Array.isArray(data.bagItems)) {
            setBagItems(data.bagItems);
            localStorage.setItem('nexus_bag_items', JSON.stringify(data.bagItems));
          }
          if (typeof data.mumuPoints === 'number') {
            setMumuPoints(data.mumuPoints);
            localStorage.setItem('nexus_mumu_points', data.mumuPoints);
          }
        } else {
          pushToCloud({ snippets, studyTasks, bagItems, mumuPoints });
        }
      } catch (e) {
        setCloudConnected(false);
      }
    };

    fetchFromCloud();
    const interval = setInterval(fetchFromCloud, 3000);
    return () => clearInterval(interval);
  }, [isFirebaseConfigured]);

  // --- LOCAL STORAGE BACKUP ---
  useEffect(() => localStorage.setItem('nexus_user_role', userRole), [userRole]);
  useEffect(() => localStorage.setItem('nexus_active_tab', activeTab), [activeTab]);
  useEffect(() => localStorage.setItem('nexus_mumu_points', mumuPoints), [mumuPoints]);
  useEffect(() => localStorage.setItem('nexus_snippets', JSON.stringify(snippets)), [snippets]);
  useEffect(() => localStorage.setItem('nexus_study_tasks', JSON.stringify(studyTasks)), [studyTasks]);
  useEffect(() => localStorage.setItem('nexus_bag_items', JSON.stringify(bagItems)), [bagItems]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const awardPoints = (amount, label = 'Bonus') => {
    const nextPts = mumuPoints + amount;
    setMumuPoints(nextPts);
    pushToCloud({ mumuPoints: nextPts });
    showToast(`+${amount} MuMu Points! (${label})`);
  };

  // --- AUTH & NAVIGATION ---
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
      showToast('🔓 Admin Mode Activated!');
    } else {
      setLoginError('Invalid credentials. Use admin@nexus.com / admin123');
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setActiveTab('snippetHub');
    setIsMobileMenuOpen(false);
    showToast('🔒 Logged out to Guest Mode.');
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

    let updated;
    if (editingSnippet) {
      updated = snippets.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, title: snippetTitle, category: snippetCategory, code: snippetCode }
          : s
      );
      showToast('✨ Snippet updated & synced!');
    } else {
      const newSnippet = {
        id: Date.now(),
        title: snippetTitle,
        category: snippetCategory,
        code: snippetCode
      };
      updated = [newSnippet, ...snippets];
      showToast('🚀 New snippet created & synced!');
    }
    setSnippets(updated);
    pushToCloud({ snippets: updated });
    setShowSnippetModal(false);
  };

  const handleDeleteSnippet = (id) => {
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    pushToCloud({ snippets: updated });
    showToast('🗑️ Snippet deleted.');
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast('📋 Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- AURA AI ENGINE (HUMAN-LIKE + MULTIMODAL VISION) ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      showToast('📎 Image attached!');
    };
    reader.readAsDataURL(file);
  };

  const generateHumanLikeFallback = (userText, hasImg) => {
    const clean = userText.toLowerCase().trim();
    if (hasImg) {
      return `That screenshot looks super clean, Prince! 📸 ${
        userText ? `About "${userText}" — ` : ''
      }let me know if you want me to write the React or Tailwind code for it!`;
    }
    if (/^(hi|hello|hey|yo|hola|sup|hii+)\b/.test(clean)) {
      return "Hey Prince! 😄 Great to see you! How's your day going? Ready to build something cool or just chilling?";
    }
    if (clean.includes('good morning') || clean.includes('gm')) {
      return "Good morning, Prince! ☀️ Hope you slept great! What are we tackling first today?";
    }
    if (clean.includes('good night') || clean.includes('gn')) {
      return "Good night, Prince! 🌙 Get some awesome rest and we'll crush more goals tomorrow!";
    }
    if (clean.includes('how are you') || clean.includes('how r u')) {
      return "I'm doing awesome, running at 100% and happy to chat with you! ⚡ How are you doing today?";
    }
    if (clean.includes('react') || clean.includes('hook') || clean.includes('state')) {
      return "In React, `useState` lets your component remember data, and `useEffect` lets it sync with external systems like Firebase! 💡";
    }
    if (clean.includes('css') || clean.includes('center')) {
      return "To center anything cleanly in CSS:\n\ndisplay: flex;\njustify-content: center;\nalign-items: center; 🎯";
    }
    return `I love that you brought up "${userText}"! 🚀 Tell me a little more about what you want to build or solve around this, and I'll write it out for you!`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if ((!userMessage && !selectedImage) || isAiLoading) return;

    const currentImage = selectedImage;
    const updatedHistory = [
      ...chatHistory, 
      { sender: 'user', text: userMessage || 'Sent an image 📸', image: currentImage }
    ];
    setChatHistory(updatedHistory);
    setChatInput('');
    setSelectedImage(null);
    setIsAiLoading(true);

    if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza')) {
      const parts = [{
        text: `You are Aura, a warm, friendly, witty, human-like AI friend and coding mentor for Prince. Respond naturally like a supportive human friend. Greet warmly when he says hi or good morning.\n\nUser: ${userMessage || 'Analyze this image for me!'}`
      }];

      if (currentImage) {
        const matches = currentImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
        }
      }

      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const m of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts }] })
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
          // Try next model or fallback
        }
      }
    }

    setTimeout(() => {
      const reply = generateHumanLikeFallback(userMessage, Boolean(currentImage));
      setChatHistory([...updatedHistory, { sender: 'aura', text: reply }]);
      setIsAiLoading(false);
    }, 500);
  };

  // --- ARCADE GAMES LOGIC ---
  const initCodele = () => {
    const randomWord = CODELE_WORDS[Math.floor(Math.random() * CODELE_WORDS.length)];
    setCodeleTarget(randomWord);
    setCodeleGuesses([]);
    setCodeleCurrent('');
    setCodeleStatus('playing');
    setActiveGame('codele');
  };

  const submitCodeleGuess = () => {
    if (codeleStatus !== 'playing') return;
    if (codeleCurrent.length !== 5) {
      showToast('⚠️ Enter a 5-letter word!');
      return;
    }
    const nextGuesses = [...codeleGuesses, codeleCurrent.toUpperCase()];
    setCodeleGuesses(nextGuesses);
    setCodeleCurrent('');

    if (codeleCurrent.toUpperCase() === codeleTarget) {
      setCodeleStatus('won');
      awardPoints(40, 'Codele Genius');
    } else if (nextGuesses.length >= 6) {
      setCodeleStatus('lost');
      showToast(`Word was: ${codeleTarget}`);
    }
  };

  const handleCodeleKey = (key) => {
    if (codeleStatus !== 'playing') return;
    if (key === 'ENTER') submitCodeleGuess();
    else if (key === 'DEL') setCodeleCurrent((prev) => prev.slice(0, -1));
    else if (/^[A-Z]$/.test(key) && codeleCurrent.length < 5) setCodeleCurrent((prev) => prev + key);
  };

  const getTileColor = (letter, index) => {
    if (!letter) return 'bg-[#050505] border-white/10 text-white';
    if (codeleTarget[index] === letter) return 'bg-emerald-600 border-emerald-500 text-white';
    if (codeleTarget.includes(letter)) return 'bg-yellow-500/80 border-yellow-400 text-black';
    return 'bg-gray-800 border-gray-700 text-gray-400';
  };

  const spawn2048Tile = (board) => {
    const empty = board.map((v, i) => (v === 0 ? i : null)).filter((v) => v !== null);
    if (empty.length === 0) return board;
    const randIdx = empty[Math.floor(Math.random() * empty.length)];
    const next = [...board];
    next[randIdx] = Math.random() < 0.85 ? 2 : 4;
    return next;
  };

  const init2048 = () => {
    let fresh = Array(16).fill(0);
    fresh = spawn2048Tile(fresh);
    fresh = spawn2048Tile(fresh);
    setGrid2048(fresh);
    setScore2048(0);
    setActiveGame('2048');
  };

  const slideRowLeft = (row) => {
    let arr = row.filter((val) => val !== 0);
    let gained = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gained += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { newRow: arr, gained };
  };

  const move2048 = (direction) => {
    let current = [...grid2048];
    let totalGained = 0;
    const getRow = (b, r) => [b[r * 4], b[r * 4 + 1], b[r * 4 + 2], b[r * 4 + 3]];
    const setRow = (b, r, row) => { b[r * 4] = row[0]; b[r * 4 + 1] = row[1]; b[r * 4 + 2] = row[2]; b[r * 4 + 3] = row[3]; };
    const getCol = (b, c) => [b[c], b[c + 4], b[c + 8], b[c + 12]];
    const setCol = (b, c, col) => { b[c] = col[0]; b[c + 4] = col[1]; b[c + 8] = col[2]; b[c + 12] = col[3]; };

    const nextBoard = [...current];
    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        let row = getRow(nextBoard, r);
        if (direction === 'RIGHT') row.reverse();
        const { newRow, gained } = slideRowLeft(row);
        if (direction === 'RIGHT') newRow.reverse();
        setRow(nextBoard, r, newRow);
        totalGained += gained;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        let col = getCol(nextBoard, c);
        if (direction === 'DOWN') col.reverse();
        const { newRow, gained } = slideRowLeft(col);
        if (direction === 'DOWN') newRow.reverse();
        setCol(nextBoard, c, newRow);
        totalGained += gained;
      }
    }

    if (JSON.stringify(current) !== JSON.stringify(nextBoard)) {
      setGrid2048(spawn2048Tile(nextBoard));
      setScore2048(score2048 + totalGained);
      if (totalGained >= 64) awardPoints(50, '2048 High Merge!');
    }
  };

  const applyLightsToggle = (board, index) => {
    const next = [...board];
    const row = Math.floor(index / 4);
    const col = index % 4;
    [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].forEach(([r, c]) => {
      if (r >= 0 && r < 4 && c >= 0 && c < 4) next[r * 4 + c] = !next[r * 4 + c];
    });
    return next;
  };

  const initLightsOut = () => {
    let board = Array(16).fill(true);
    for (let i = 0; i < 6; i++) board = applyLightsToggle(board, Math.floor(Math.random() * 16));
    setLightsGrid(board);
    setLightsMoves(0);
    setActiveGame('lights');
  };

  const handleLightClick = (idx) => {
    const updated = applyLightsToggle(lightsGrid, idx);
    setLightsGrid(updated);
    setLightsMoves(lightsMoves + 1);
    if (updated.every((c) => c === true)) awardPoints(45, 'Quantum Matrix Solved!');
  };

  const nextStroopRound = () => {
    const wIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    let cIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    if (cIdx === wIdx) cIdx = (cIdx + 1) % STROOP_COLORS.length;
    setStroopWordIdx(wIdx);
    setStroopColorIdx(cIdx);
    setStroopMode(Math.random() < 0.5 ? 'COLOR' : 'MEANING');
  };

  const initStroopGame = () => {
    setStroopStreak(0);
    nextStroopRound();
    setActiveGame('stroop');
  };

  const handleStroopAnswer = (pickedIndex) => {
    const correctIndex = stroopMode === 'MEANING' ? stroopWordIdx : stroopColorIdx;
    if (pickedIndex === correctIndex) {
      const nextStreak = stroopStreak + 1;
      setStroopStreak(nextStreak);
      if (nextStreak % 5 === 0) awardPoints(30, `${nextStreak}x Mind Streak!`);
      nextStroopRound();
    } else {
      showToast('❌ Brain Tricked! Streak reset.');
      setStroopStreak(0);
      nextStroopRound();
    }
  };

  // --- STUDY & BAG HANDLERS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const updated = [...studyTasks, { id: Date.now(), text: newTaskText, done: false }];
    setStudyTasks(updated);
    pushToCloud({ studyTasks: updated });
    setNewTaskText('');
    showToast('✅ Study goal added & synced!');
  };

  const toggleStudyTask = (id) => {
    const updated = studyTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setStudyTasks(updated);
    pushToCloud({ studyTasks: updated });
  };

  const deleteStudyTask = (id) => {
    const updated = studyTasks.filter(t => t.id !== id);
    setStudyTasks(updated);
    pushToCloud({ studyTasks: updated });
  };

  const handleAddBagItem = (e) => {
    e.preventDefault();
    if (!newBagItem.trim()) return;
    const updated = [...bagItems, { id: Date.now(), text: newBagItem, packed: false }];
    setBagItems(updated);
    pushToCloud({ bagItems: updated });
    setNewBagItem('');
    showToast('🎒 Item added & synced!');
  };

  const toggleBagItem = (id) => {
    const updated = bagItems.map(b => b.id === id ? { ...b, packed: !b.packed } : b);
    setBagItems(updated);
    pushToCloud({ bagItems: updated });
  };

  const deleteBagItem = (id) => {
    const updated = bagItems.filter(b => b.id !== id);
    setBagItems(updated);
    pushToCloud({ bagItems: updated });
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'snippetHub':
        return (
          <div className="p-4 md:p-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                    Snippet Hub
                  </h1>
                  {userRole === 'admin' && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Admin Mode
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    cloudConnected 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-gray-500/10 text-gray-400 border-white/10'
                  }`}>
                    {cloudConnected ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                    {cloudConnected ? 'Live Cloud Sync Active' : 'Local Mode'}
                  </span>
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
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {userRole === 'admin' && (
                  <button 
                    onClick={openAddSnippetModal}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shrink-0 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Snippet
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((snippet) => (
                <div key={snippet.id} className="bg-[#12121a] p-5 rounded-xl border border-white/10 hover:border-indigo-500/60 hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400">
                      {snippet.category || 'CODE'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCopyCode(snippet.id, snippet.code)} className="p-1.5 text-gray-400 hover:text-white rounded bg-white/5">
                        {copiedId === snippet.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button onClick={() => openEditSnippetModal(snippet)} className="p-1.5 text-gray-400 hover:text-indigo-400 rounded bg-white/5">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSnippet(snippet.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded bg-white/5">
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
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Gen-Z Logic & Brain Arcade
                </h1>
                <p className="text-gray-400 text-sm">Tricky puzzles & cognitive challenges.</p>
              </div>
              {activeGame && (
                <button onClick={() => setActiveGame(null)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  ← Exit Game
                </button>
              )}
            </div>

            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-emerald-500/60 transition-all flex flex-col items-center text-center">
                  <Terminal className="w-10 h-10 text-emerald-400 mb-3" />
                  <h3 className="text-xl font-bold mb-2">CODELE (5-Letter Tech Wordle)</h3>
                  <p className="text-gray-400 text-sm mb-5">Crack the hidden 5-letter tech word in 6 tries.</p>
                  <button onClick={initCodele} className="mt-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-bold">
                    Play CODELE (+40 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-indigo-500/60 transition-all flex flex-col items-center text-center">
                  <Grid className="w-10 h-10 text-indigo-400 mb-3" />
                  <h3 className="text-xl font-bold mb-2">2048: Cyber Merge</h3>
                  <p className="text-gray-400 text-sm mb-5">Slide and merge power-of-2 tiles on a 4x4 grid.</p>
                  <button onClick={init2048} className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-bold">
                    Play 2048 (+50 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-pink-500/60 transition-all flex flex-col items-center text-center">
                  <Cpu className="w-10 h-10 text-pink-400 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Quantum Lights Out</h3>
                  <p className="text-gray-400 text-sm mb-5">Tapping a node flips its 4 neighbors. Turn all 16 ON!</p>
                  <button onClick={initLightsOut} className="mt-auto bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-bold">
                    Play Lights Out (+45 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-amber-500/60 transition-all flex flex-col items-center text-center">
                  <Brain className="w-10 h-10 text-amber-400 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Stroop Mind Paradox</h3>
                  <p className="text-gray-400 text-sm mb-5">Beat the color-word illusion as rules flip every round!</p>
                  <button onClick={initStroopGame} className="mt-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-full font-bold">
                    Play Mind Paradox (+30 MuMu)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 max-w-lg mx-auto text-center">
                {activeGame === 'codele' && (
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-4">CODELE</h2>
                    <div className="space-y-2 max-w-[250px] mx-auto mb-6">
                      {Array.from({ length: 6 }).map((_, rIdx) => {
                        const guess = codeleGuesses[rIdx] || (rIdx === codeleGuesses.length ? codeleCurrent : '');
                        const submitted = rIdx < codeleGuesses.length;
                        return (
                          <div key={rIdx} className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((__, cIdx) => {
                              const letter = guess[cIdx] || '';
                              return (
                                <div key={cIdx} className={`h-11 rounded-lg border font-mono font-bold text-lg flex items-center justify-center ${submitted ? getTileColor(letter, cIdx) : 'bg-[#050505] border-white/20'}`}>
                                  {letter}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    {codeleStatus === 'playing' ? (
                      <div className="space-y-2">
                        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, i) => (
                          <div key={i} className="flex justify-center gap-1">
                            {row.split('').map(c => (
                              <button key={c} onClick={() => handleCodeleKey(c)} className="bg-white/10 hover:bg-white/20 px-2.5 py-2 rounded text-xs font-bold">{c}</button>
                            ))}
                          </div>
                        ))}
                        <div className="flex justify-center gap-2 pt-2">
                          <button onClick={() => handleCodeleKey('DEL')} className="bg-red-500/20 text-red-300 px-4 py-2 rounded text-xs font-bold">DEL</button>
                          <button onClick={() => handleCodeleKey('ENTER')} className="bg-emerald-600 text-white px-6 py-2 rounded text-xs font-bold">SUBMIT</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={initCodele} className="bg-emerald-600 px-5 py-2 rounded-lg text-sm font-bold">Play Again</button>
                    )}
                  </div>
                )}

                {activeGame === '2048' && (
                  <div>
                    <h2 className="text-xl font-bold text-indigo-400 mb-3">2048: Cyber Merge (Score: {score2048})</h2>
                    <div className="grid grid-cols-4 gap-2 bg-[#050505] p-3 rounded-xl max-w-[260px] mx-auto mb-4">
                      {grid2048.map((val, idx) => (
                        <div key={idx} className={`h-12 rounded-lg font-mono font-bold flex items-center justify-center ${val ? 'bg-indigo-600 text-white' : 'bg-white/5 text-transparent'}`}>
                          {val || '.'}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => move2048('UP')} className="bg-white/10 p-3 rounded-xl"><ArrowUp className="w-5 h-5" /></button>
                      <div className="flex gap-3">
                        <button onClick={() => move2048('LEFT')} className="bg-white/10 p-3 rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
                        <button onClick={() => move2048('DOWN')} className="bg-white/10 p-3 rounded-xl"><ArrowDown className="w-5 h-5" /></button>
                        <button onClick={() => move2048('RIGHT')} className="bg-white/10 p-3 rounded-xl"><ArrowRight className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                )}

                {activeGame === 'lights' && (
                  <div>
                    <h2 className="text-xl font-bold text-pink-400 mb-3">Quantum Lights Out (Moves: {lightsMoves})</h2>
                    <div className="grid grid-cols-4 gap-3 max-w-[240px] mx-auto mb-4">
                      {lightsGrid.map((on, idx) => (
                        <button key={idx} onClick={() => handleLightClick(idx)} className={`h-12 rounded-xl border flex items-center justify-center ${on ? 'bg-pink-500 border-pink-300' : 'bg-[#050505] border-white/10'}`}>
                          <Zap className="w-4 h-4 text-white" />
                        </button>
                      ))}
                    </div>
                    <button onClick={initLightsOut} className="bg-pink-600 px-4 py-2 rounded-lg text-xs font-bold">Reset Matrix</button>
                  </div>
                )}

                {activeGame === 'stroop' && (
                  <div>
                    <h2 className="text-xl font-bold text-amber-400 mb-2">Stroop Mind Paradox (Streak: {stroopStreak})</h2>
                    <div className="bg-[#050505] p-6 rounded-xl border border-white/10 mb-4">
                      <div className="text-xs font-bold bg-white/10 inline-block px-3 py-1 rounded-full mb-3">
                        {stroopMode === 'MEANING' ? '🧠 TAP THE WORD MEANING' : '🎨 TAP THE INK COLOR'}
                      </div>
                      <div className="text-4xl font-black py-3" style={{ color: STROOP_COLORS[stroopColorIdx].hex }}>
                        {STROOP_COLORS[stroopWordIdx].name}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {STROOP_COLORS.map((col, idx) => (
                        <button key={col.name} onClick={() => handleStroopAnswer(idx)} className={`${col.bg} text-black font-extrabold py-3 rounded-xl`}>
                          {col.name}
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
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-indigo-400 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> Aura AI Companion
                </h1>
                <p className="text-xs text-gray-400">Friendly human-like AI & image vision tutor</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                ● Online
              </span>
            </div>
            
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#12121a] border border-white/10 text-gray-200 rounded-tl-none'}`}>
                    {msg.image && <img src={msg.image} alt="Upload" className="max-h-48 rounded-lg mb-2" />}
                    <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAiLoading && <div className="text-xs text-gray-400 pl-11">Aura is typing...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0f]">
              {selectedImage && (
                <div className="flex items-center gap-3 mb-2 bg-[#12121a] p-2 rounded-lg w-fit">
                  <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded" />
                  <button onClick={() => setSelectedImage(null)} className="text-red-400"><X className="w-4 h-4" /></button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#12121a] border border-white/10 p-3 rounded-lg text-gray-400 hover:text-white">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Say hi, good morning, ask a question, or attach an image..." 
                  className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-lg">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </div>
        );

      case 'studyPlanner':
        return (
          <div className="p-4 md:p-8 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">AI Study Planner</h1>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add study goal..." className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white" />
              <button type="submit" className="bg-emerald-600 text-white px-5 py-3 rounded-lg text-sm font-bold">Add Goal</button>
            </form>
            <div className="space-y-3">
              {studyTasks.map(task => (
                <div key={task.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleStudyTask(task.id)}>
                    <input type="checkbox" checked={task.done} readOnly className="w-4 h-4 accent-emerald-500" />
                    <span className={task.done ? 'line-through text-gray-500' : 'text-white'}>{task.text}</span>
                  </div>
                  <button onClick={() => deleteStudyTask(task.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bagPacker':
        return (
          <div className="p-4 md:p-8 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Routine & Bag Packer</h1>
            <form onSubmit={handleAddBagItem} className="flex gap-2 mb-6">
              <input type="text" value={newBagItem} onChange={(e) => setNewBagItem(e.target.value)} placeholder="Add item to pack..." className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white" />
              <button type="submit" className="bg-orange-600 text-white px-5 py-3 rounded-lg text-sm font-bold">Add Item</button>
            </form>
            <div className="space-y-3">
              {bagItems.map(item => (
                <div key={item.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleBagItem(item.id)}>
                    <input type="checkbox" checked={item.packed} readOnly className="w-4 h-4 accent-orange-500" />
                    <span className={item.packed ? 'line-through text-gray-500' : 'text-white'}>{item.text}</span>
                  </div>
                  <button onClick={() => deleteBagItem(item.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold">
          <Zap className="w-4 h-4 text-yellow-300" /> {toast}
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="font-bold text-lg text-indigo-400 flex items-center gap-2"><Shield className="w-5 h-5" /> Nexus Studio</div>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {mumuPoints}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-white">
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/70 z-40" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/10 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="font-bold text-xl">NEXUS</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Studio OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <button onClick={() => handleNavigation('snippetHub')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'snippetHub' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400'}`}>
            <Code className="w-5 h-5" /> Snippet Hub
          </button>
          <button onClick={() => handleNavigation('arcadeLounge')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'arcadeLounge' ? 'bg-pink-600/10 text-pink-400' : 'text-gray-400'}`}>
            <Play className="w-5 h-5" /> Arcade Lounge
          </button>
          <button onClick={() => handleNavigation('auraBot')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'auraBot' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400'}`}>
            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> Aura AI Bot</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
          <button onClick={() => handleNavigation('studyPlanner')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'studyPlanner' ? 'bg-emerald-600/10 text-emerald-400' : 'text-gray-400'}`}>
            <div className="flex items-center gap-3"><CheckSquare className="w-5 h-5" /> AI Study Planner</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
          <button onClick={() => handleNavigation('bagPacker')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'bagPacker' ? 'bg-orange-600/10 text-orange-400' : 'text-gray-400'}`}>
            <div className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> Routine & Packer</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          {userRole === 'guest' ? (
            <button onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }} className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-bold">
              System Login
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[#12121a] p-3 rounded-lg">
              <span className="text-sm font-bold">Nexus Admin</span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-y-auto bg-[#050505]">
        {renderContent()}
      </div>

      {showSnippetModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{editingSnippet ? 'Edit Snippet' : 'Add New Snippet'}</h2>
            <form onSubmit={handleSaveSnippet} className="space-y-4">
              <input type="text" value={snippetTitle} onChange={(e) => setSnippetTitle(e.target.value)} placeholder="Title" className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white" required />
              <select value={snippetCategory} onChange={(e) => setSnippetCategory(e.target.value)} className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white">
                <option value="JS">JavaScript (JS)</option>
                <option value="REACT">React</option>
                <option value="CSS">CSS</option>
                <option value="PYTHON">Python</option>
              </select>
              <textarea rows={5} value={snippetCode} onChange={(e) => setSnippetCode(e.target.value)} placeholder="Code..." className="w-full bg-[#12121a] border border-white/10 rounded-lg p-3 text-sm font-mono text-white" required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowSnippetModal(false)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-4">Secure Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" placeholder="admin@nexus.com" required />
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" placeholder="••••••••" required />
              {loginError && <div className="text-red-400 text-xs text-center">{loginError}</div>}
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-bold">Initialize Login</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
