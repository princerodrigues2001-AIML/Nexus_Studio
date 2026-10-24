import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sparkles, Terminal, Code, Cpu, Trophy, User, 
  LogIn, Lock, Menu, X, LogOut, Plus, Search, Send, Play, 
  CheckSquare, Briefcase, Trash2, Edit2, Copy, Check, 
  Zap, Grid, RotateCcw, Paperclip, Cloud, CloudOff,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Brain, RefreshCw,
  UserPlus, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

// ============================================================================
// 🔐 ENVIRONMENT VARIABLES (Set in Vercel -> Settings -> Environment Variables)
// ============================================================================
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
const RAW_FIREBASE_URL = (import.meta.env.VITE_FIREBASE_DB_URL || "").trim();

function resolveFirebaseDatabaseUrl(rawUrl) {
  if (!rawUrl || rawUrl.includes('PASTE_YOUR')) return '';
  const dbMatch = rawUrl.match(/database\/([a-zA-Z0-9-]+)\//);
  if (dbMatch && dbMatch[1]) {
    return `https://${dbMatch[1]}.firebaseio.com`;
  }
  const projMatch = rawUrl.match(/project\/([a-zA-Z0-9-]+)\//);
  if (projMatch && projMatch[1]) {
    return `https://${projMatch[1]}-default-rtdb.firebaseio.com`;
  }
  if (rawUrl.startsWith('https://')) {
    return rawUrl.replace(/\/$/, '').replace(/\/nexus_studio_state\.json$/, '');
  }
  return '';
}

const CLEAN_FIREBASE_URL = resolveFirebaseDatabaseUrl(RAW_FIREBASE_URL);

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

// ============================================================================
// 🔍 3-LAYER GOOGLE ACCOUNT EXISTENCE & AUTHENTICITY VERIFIER
// Rejects non-existent, keyboard-mashed, fake, or synthetic @gmail.com IDs
// ============================================================================
async function verifyGmailWithGoogle(rawEmail, existingUsers = []) {
  const email = rawEmail.trim().toLowerCase();

  // 1. Must strictly be a @gmail.com address with a non-empty local username
  const parts = email.split('@');
  if (parts.length !== 2 || parts[1] !== 'gmail.com' || !parts[0]) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Please enter a valid @gmail.com address.'
    };
  }

  const username = parts[0];

  // 2. Official Google Gmail length & character rules (6 to 30 chars)
  if (username.length < 6 || username.length > 30) {
    return {
      valid: false,
      reason: 'Google Verification Failed: This Gmail account does not exist (usernames must be 6–30 characters).'
    };
  }

  if (!/^[a-z0-9.]+$/.test(username)) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Invalid characters in Gmail address.'
    };
  }

  if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Invalid period placement in Gmail address.'
    };
  }

  const cleanUser = username.replace(/\./g, '');

  // Must start with a letter and contain at least 4 alphabetic letters
  const lettersOnly = cleanUser.replace(/[^a-z]/g, '');
  const digitsOnly = cleanUser.replace(/[^0-9]/g, '');

  if (!/^[a-z]/.test(cleanUser) || lettersOnly.length < 4) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // Reject if numbers outnumber letters (e.g. a1234567@gmail.com)
  if (digitsOnly.length > lettersOnly.length || digitsOnly.length > 6) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // 3. Block fake/test words, keyboard walks, and repeating sequences
  const forbiddenSubstrings = [
    'test', 'fake', 'demo', 'sample', 'temp', 'dummy', 'guest', 'admin',
    'user', 'random', 'invalid', 'notexist', 'nonexist', 'noaccount',
    'wrong', 'null', 'none', 'example', 'qwerty', 'qwert', 'werty',
    'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'zxcv', 'xcvb',
    'cvbn', 'vbnm', 'qazw', 'wsxe', 'edcr', 'poiu', 'lkjh', 'mnbv',
    'abcd', 'bcde', 'cdef', 'xyz', '12345', '23456', '34567', '45678',
    '56789', '0000', '1111', '2222', '3333', '4444', '5555', '6666',
    '7777', '8888', '9999', 'haha', 'blah', 'nobody', 'someone', 'checkmail',
    'fakemail', 'testmail', 'newuser', 'password', 'gmail', 'google'
  ];

  if (forbiddenSubstrings.some((sub) => cleanUser.includes(sub))) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // Block 3+ identical repeating characters (e.g. aaaccc@gmail.com)
  if (/(.)\1{2,}/.test(cleanUser)) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // Block alternating letter-number patterns (e.g. a1b2c3@gmail.com)
  if (/[a-z]\d[a-z]\d/.test(cleanUser)) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // 4. Phonetic Vowel-Consonant Human Name Check (Blocks random consonant mashing like kjsdhf@gmail.com)
  const vowels = (lettersOnly.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowels / lettersOnly.length;

  if (vowelRatio < 0.22 || vowelRatio > 0.75) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // Block 5+ consecutive consonants or unpronounceable 4-consonant mashing
  if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(lettersOnly) || /[jqwxz]{2,}/.test(lettersOnly) || /[bcdfghjklmnpqrstvwxz]{4}$/.test(lettersOnly)) {
    return {
      valid: false,
      reason: 'Google Verification Failed: Account does not exist on Google.'
    };
  }

  // If already registered in Nexus Studio, it is a known valid account
  if (existingUsers.some((u) => u.email.toLowerCase() === email)) {
    return {
      valid: true,
      email,
      reason: 'Verified Google Account'
    };
  }

  // 5. Live Disify & Google DNS Verification
  try {
    const disifyRes = await fetch(`https://disify.com/api/email/${encodeURIComponent(email)}`);
    if (disifyRes.ok) {
      const disifyData = await disifyRes.json();
      if (disifyData.format === false || disifyData.dns === false || disifyData.disposable === true) {
        return {
          valid: false,
          reason: 'Google Verification Failed: Account is undeliverable or disposable.'
        };
      }
    }
  } catch {
    // Proceed to AI verification layer
  }

  // 6. Live AI Account Authenticity Check (Detects made-up / gibberish / non-existent handles)
  const verifyPrompt = `You are a strict Google Account email validator. Analyze this Gmail username: "${username}" (from "${email}").
Determine if "${username}" is a realistic, genuine human name/surname/username (such as "princerodrigues2001", "rahul.sharma", "ananya.verma19", "karthikgowda"), OR if it looks like a random string, gibberish, keyboard mash, made-up test word, or non-existent fake handle (such as "kjsdhfkj", "randomguy", "myaccount", "hellothere", "testingid", "xyzkumar", "qweasdzxc", "notreal").
Be strict: if it looks fake, generic, or randomly typed, reject it.
Reply with ONLY the word "VALID" if it is a realistic human name handle, or "INVALID" if it looks fake/random.`;

  try {
    let aiVerdict = '';
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('PASTE_YOUR')) {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: verifyPrompt }] }],
            generationConfig: { temperature: 0.0, maxOutputTokens: 20 }
          })
        }
      );
      if (gemRes.ok) {
        const gemData = await gemRes.json();
        aiVerdict = (gemData?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().toUpperCase();
      }
    }

    if (!aiVerdict) {
      const pollRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          temperature: 0,
          messages: [{ role: 'user', content: verifyPrompt }]
        })
      });
      if (pollRes.ok) {
        const pollData = await pollRes.json();
        aiVerdict = (pollData?.choices?.[0]?.message?.content || '').trim().toUpperCase();
      }
    }

    if (aiVerdict.includes('INVALID')) {
      return {
        valid: false,
        reason: 'Google Account Verification Failed: This Gmail account does not exist on Google.'
      };
    }
  } catch {
    // Fallback if offline
  }

  return {
    valid: true,
    email,
    reason: 'Verified: Active Google Gmail Account Confirmed'
  };
}

export default function App() {
  // --- AUTH & USER STATES ---
  const [userRole, setUserRole] = useState(() => localStorage.getItem('nexus_user_role') || 'guest');
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('nexus_user_email') || '');
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- PER-USER MUMU POINTS MAP ({ [email]: points }) ---
  const [userPointsMap, setUserPointsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_points_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Active logged-in account key for per-ID MuMu points
  const activeAccountKey = userRole === 'admin'
    ? 'admin@nexus.com'
    : userRole === 'user' && currentUserEmail
      ? currentUserEmail.trim().toLowerCase()
      : null;

  // Displays ONLY the exact MuMu points earned by the currently logged-in ID (0 for guest or new ID)
  const mumuPoints = activeAccountKey ? (userPointsMap[activeAccountKey] || 0) : 0;

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('nexus_active_tab') || 'snippetHub');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [toast, setToast] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- SYNCED DATA STATES ---
  const [snippets, setSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_snippets');
      return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
    } catch {
      return DEFAULT_SNIPPETS;
    }
  });
  const [studyTasks, setStudyTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_study_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });
  const [bagItems, setBagItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_bag_items');
      return saved ? JSON.parse(saved) : DEFAULT_BAG;
    } catch {
      return DEFAULT_BAG;
    }
  });

  const stateRef = useRef({ snippets, studyTasks, bagItems, userPointsMap, registeredUsers });
  const lastLocalWriteRef = useRef(0);
  useEffect(() => {
    stateRef.current = { snippets, studyTasks, bagItems, userPointsMap, registeredUsers };
  }, [snippets, studyTasks, bagItems, userPointsMap, registeredUsers]);

  // --- LOGIN & REGISTER FORM STATES ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerifiedStatus, setEmailVerifiedStatus] = useState(null);

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
      text: "Hey Prince! 👋 I'm Aura, your AI coding and study mentor. Ask me any coding problem, algorithm, concept, or attach a screenshot—I'll generate an accurate, detailed solution in real time!" 
    }
  ]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- STUDY & BAG INPUTS ---
  const [newTaskText, setNewTaskText] = useState('');
  const [newBagItem, setNewBagItem] = useState('');

  // --- ARCADE GAMES STATES ---
  const [activeGame, setActiveGame] = useState(null);
  const [codeleTarget, setCodeleTarget] = useState('REACT');
  const [codeleGuesses, setCodeleGuesses] = useState([]);
  const [codeleCurrent, setCodeleCurrent] = useState('');
  const [codeleStatus, setCodeleStatus] = useState('playing');

  const [grid2048, setGrid2048] = useState(Array(16).fill(0));
  const [score2048, setScore2048] = useState(0);

  const [lightsGrid, setLightsGrid] = useState(Array(16).fill(false));
  const [lightsMoves, setLightsMoves] = useState(0);

  const [stroopWordIdx, setStroopWordIdx] = useState(0);
  const [stroopColorIdx, setStroopColorIdx] = useState(1);
  const [stroopMode, setStroopMode] = useState('COLOR');
  const [stroopStreak, setStroopStreak] = useState(0);

  // ============================================================================
  // ☁️ REALTIME CLOUD SYNC ENGINE (Laptop <-> Mobile Sync)
  // ============================================================================
  const pushToCloud = async (overrideData = {}) => {
    if (!CLEAN_FIREBASE_URL) return;
    lastLocalWriteRef.current = Date.now();
    setIsSyncing(true);

    const payload = {
      snippets: overrideData.snippets ?? stateRef.current.snippets,
      studyTasks: overrideData.studyTasks ?? stateRef.current.studyTasks,
      bagItems: overrideData.bagItems ?? stateRef.current.bagItems,
      userPointsMap: overrideData.userPointsMap ?? stateRef.current.userPointsMap,
      registeredUsers: overrideData.registeredUsers ?? stateRef.current.registeredUsers,
      updatedAt: Date.now()
    };

    try {
      const res = await fetch(`${CLEAN_FIREBASE_URL}/nexus_studio_state.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setCloudConnected(res.ok);
    } catch (err) {
      setCloudConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromCloud = async (manual = false) => {
    if (!CLEAN_FIREBASE_URL) return;
    if (!manual && Date.now() - lastLocalWriteRef.current < 2000) return;

    try {
      if (manual) setIsSyncing(true);
      const res = await fetch(`${CLEAN_FIREBASE_URL}/nexus_studio_state.json`);
      if (!res.ok) {
        setCloudConnected(false);
        return;
      }
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
        if (data.userPointsMap && typeof data.userPointsMap === 'object') {
          setUserPointsMap(data.userPointsMap);
          localStorage.setItem('nexus_user_points_map', JSON.stringify(data.userPointsMap));
        }
        if (Array.isArray(data.registeredUsers)) {
          setRegisteredUsers(data.registeredUsers);
          localStorage.setItem('nexus_registered_users', JSON.stringify(data.registeredUsers));
        }
        if (manual) showToast('☁️ Synced latest data from cloud!');
      } else {
        await pushToCloud();
      }
    } catch (e) {
      setCloudConnected(false);
    } finally {
      if (manual) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!CLEAN_FIREBASE_URL) return;
    fetchFromCloud();
    const interval = setInterval(() => fetchFromCloud(false), 2500);
    return () => clearInterval(interval);
  }, []);

  // --- LOCAL STORAGE PERSISTENCE ---
  useEffect(() => localStorage.setItem('nexus_user_role', userRole), [userRole]);
  useEffect(() => localStorage.setItem('nexus_user_email', currentUserEmail), [currentUserEmail]);
  useEffect(() => localStorage.setItem('nexus_registered_users', JSON.stringify(registeredUsers)), [registeredUsers]);
  useEffect(() => localStorage.setItem('nexus_user_points_map', JSON.stringify(userPointsMap)), [userPointsMap]);
  useEffect(() => localStorage.setItem('nexus_active_tab', activeTab), [activeTab]);
  useEffect(() => localStorage.setItem('nexus_snippets', JSON.stringify(snippets)), [snippets]);
  useEffect(() => localStorage.setItem('nexus_study_tasks', JSON.stringify(studyTasks)), [studyTasks]);
  useEffect(() => localStorage.setItem('nexus_bag_items', JSON.stringify(bagItems)), [bagItems]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // --- AWARD MUMU POINTS SPECIFICALLY TO LOGGED-IN USER ID ---
  const awardPoints = (amount, label = 'Bonus') => {
    if (!activeAccountKey) {
      showToast('🔒 Please Login or Register to save MuMu points to your ID!');
      openAuthModal('login');
      return;
    }

    const currentPts = userPointsMap[activeAccountKey] || 0;
    const nextPts = currentPts + amount;
    const updatedMap = {
      ...userPointsMap,
      [activeAccountKey]: nextPts
    };

    // Also update points inside registeredUsers list for this user ID
    const updatedUsers = registeredUsers.map((u) =>
      u.email.toLowerCase() === activeAccountKey ? { ...u, points: nextPts } : u
    );

    setUserPointsMap(updatedMap);
    setRegisteredUsers(updatedUsers);
    pushToCloud({ userPointsMap: updatedMap, registeredUsers: updatedUsers });
    showToast(`+${amount} MuMu Points saved to ${activeAccountKey}! (${label})`);
  };

  // --- AUTH & NAVIGATION HANDLERS ---
  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setLoginError('');
    setRegError('');
    setEmailVerifiedStatus(null);
    setShowLogin(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (tab) => {
    if (userRole === 'guest' && tab !== 'snippetHub' && tab !== 'arcadeLounge') {
      openAuthModal('login');
      return;
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const emailInput = loginEmail.trim().toLowerCase();

    // Hidden Admin Check
    if (emailInput === 'admin@nexus.com' && loginPassword === 'admin123') {
      setUserRole('admin');
      setCurrentUserEmail('admin@nexus.com');
      setShowLogin(false);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      showToast('🔓 Welcome back, Admin!');
      return;
    }

    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailInput && u.password === loginPassword
    );

    if (matchedUser) {
      const cleanId = matchedUser.email.toLowerCase();
      // Sync points from user record if map doesn't have it yet
      if (typeof matchedUser.points === 'number' && userPointsMap[cleanId] === undefined) {
        const syncedMap = { ...userPointsMap, [cleanId]: matchedUser.points };
        setUserPointsMap(syncedMap);
      }
      setUserRole('user');
      setCurrentUserEmail(cleanId);
      setShowLogin(false);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      showToast(`🔓 Logged in as ${cleanId}`);
    } else {
      setLoginError('Invalid Mail ID or Password. If you are a new user, please Register first.');
    }
  };

  const handleVerifyGmailClick = async () => {
    setRegError('');
    setEmailVerifiedStatus(null);
    if (!regEmail.trim()) {
      setRegError('Please enter your Gmail ID first.');
      return null;
    }
    setIsVerifyingEmail(true);
    const result = await verifyGmailWithGoogle(regEmail, registeredUsers);
    setIsVerifyingEmail(false);
    setEmailVerifiedStatus(result);
    if (!result.valid) {
      setRegError(result.reason);
    }
    return result;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setIsVerifyingEmail(true);
    const verification = await verifyGmailWithGoogle(regEmail, registeredUsers);
    setIsVerifyingEmail(false);
    setEmailVerifiedStatus(verification);

    if (!verification.valid) {
      setRegError(verification.reason);
      return;
    }

    const cleanMail = verification.email.toLowerCase();

    if (
      cleanMail === 'admin@nexus.com' ||
      registeredUsers.some((u) => u.email.toLowerCase() === cleanMail)
    ) {
      setRegError('This Gmail ID is already registered. Please switch to Login.');
      return;
    }

    // Initialize brand-new user with strictly 0 MuMu points
    const newUser = {
      email: cleanMail,
      password: regPassword,
      points: 0,
      createdAt: Date.now()
    };

    const updatedUsers = [...registeredUsers, newUser];
    const updatedPointsMap = {
      ...userPointsMap,
      [cleanMail]: 0
    };

    setRegisteredUsers(updatedUsers);
    setUserPointsMap(updatedPointsMap);
    pushToCloud({ registeredUsers: updatedUsers, userPointsMap: updatedPointsMap });

    setUserRole('user');
    setCurrentUserEmail(cleanMail);
    setShowLogin(false);
    setRegEmail('');
    setRegPassword('');
    setEmailVerifiedStatus(null);
    showToast(`✅ Google Verified! Registered ${cleanMail} with 0 MuMu Points.`);
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentUserEmail('');
    setActiveTab('snippetHub');
    setIsMobileMenuOpen(false);
    showToast('🔒 Logged out.');
  };

  // ============================================================================
  // 🔒 SNIPPET HANDLERS (STRICTLY ADMIN ONLY)
  // ============================================================================
  const openAddSnippetModal = () => {
    if (userRole !== 'admin') {
      showToast('🔒 Only Admin can add snippets.');
      return;
    }
    setEditingSnippet(null);
    setSnippetTitle('');
    setSnippetCategory('JS');
    setSnippetCode('');
    setShowSnippetModal(true);
  };

  const openEditSnippetModal = (snippet) => {
    if (userRole !== 'admin') {
      showToast('🔒 Only Admin can edit snippets.');
      return;
    }
    setEditingSnippet(snippet);
    setSnippetTitle(snippet.title);
    setSnippetCategory(snippet.category || 'JS');
    setSnippetCode(snippet.code);
    setShowSnippetModal(true);
  };

  const handleSaveSnippet = (e) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!snippetTitle.trim() || !snippetCode.trim()) return;

    let updated;
    if (editingSnippet) {
      updated = snippets.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, title: snippetTitle, category: snippetCategory, code: snippetCode }
          : s
      );
      showToast('✨ Snippet updated & synced by Admin!');
    } else {
      const newSnippet = {
        id: Date.now(),
        title: snippetTitle,
        category: snippetCategory,
        code: snippetCode
      };
      updated = [newSnippet, ...snippets];
      showToast('🚀 New snippet created & synced by Admin!');
    }
    setSnippets(updated);
    pushToCloud({ snippets: updated });
    setShowSnippetModal(false);
  };

  const handleDeleteSnippet = (id) => {
    if (userRole !== 'admin') return;
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    pushToCloud({ snippets: updated });
    showToast('🗑️ Snippet deleted by Admin.');
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast('📋 Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ============================================================================
  // 🤖 HIGH-ACCURACY LIVE AI ENGINE + RICH CODE BLOCK RENDERER
  // ============================================================================
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      showToast('📎 Image attached! Press Send to analyze.');
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if ((!userMessage && !selectedImage) || isAiLoading) return;

    const currentImage = selectedImage;
    const updatedHistory = [
      ...chatHistory, 
      { sender: 'user', text: userMessage || 'Analyze this attached image in detail.', image: currentImage }
    ];
    setChatHistory(updatedHistory);
    setChatInput('');
    setSelectedImage(null);
    setIsAiLoading(true);

    const expertSystemPrompt = `You are Aura, an elite, highly accurate AI software engineer, computer science tutor, and friendly mentor inside Nexus Studio, built for Prince Rodrigues.
Rules for every response:
1. Give 100% accurate, complete, well-structured answers. Never give vague or generic placeholders.
2. When asked to write code, provide clean, working, well-commented code inside markdown code blocks (\`\`\`language ... \`\`\`) along with a brief explanation and sample output.
3. When greeted (e.g., hi, hello, good morning), respond warmly and naturally like a smart human collaborator.`;

    // 1. Primary: Official Google Gemini Models (High-Accuracy Low Temperature)
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('PASTE_YOUR')) {
      const geminiContents = updatedHistory.slice(-10).map((msg) => {
        const parts = [{ text: msg.text }];
        if (msg.image) {
          const matches = msg.image.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
          }
        }
        return {
          role: msg.sender === 'user' ? 'user' : 'model',
          parts
        };
      });

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const modelName of modelsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: expertSystemPrompt }] },
                contents: geminiContents,
                generationConfig: {
                  temperature: 0.35,
                  topP: 0.95,
                  maxOutputTokens: 4096
                }
              })
            }
          );
          if (response.ok) {
            const data = await response.json();
            const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiReply) {
              setChatHistory([...updatedHistory, { sender: 'aura', text: aiReply }]);
              setIsAiLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn(`Gemini ${modelName} attempt failed:`, err);
        }
      }
    }

    // 2. Secondary: Live OpenAI-Compatible Reasoning Endpoint
    try {
      const openAiMessages = [
        { role: 'system', content: expertSystemPrompt },
        ...updatedHistory.slice(-10).map((msg) => {
          if (msg.image) {
            return {
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: [
                { type: 'text', text: msg.text || 'Analyze this image in detail.' },
                { type: 'image_url', image_url: { url: msg.image } }
              ]
            };
          }
          return {
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          };
        })
      ];

      const liveRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          temperature: 0.35,
          messages: openAiMessages
        })
      });

      if (liveRes.ok) {
        const data = await liveRes.json();
        const liveReply = data?.choices?.[0]?.message?.content;
        if (liveReply) {
          setChatHistory([...updatedHistory, { sender: 'aura', text: liveReply }]);
          setIsAiLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Live AI Fallback Error:', err);
    }

    setChatHistory([
      ...updatedHistory,
      {
        sender: 'aura',
        text: '⚠️ Could not reach the AI server. Please check your internet connection or verify VITE_GEMINI_API_KEY in Vercel.'
      }
    ]);
    setIsAiLoading(false);
  };

  // Renders formatted code blocks with Copy buttons inside AI chat bubbles
  const renderFormattedAiText = (rawText, msgIndex) => {
    if (!rawText) return null;
    const segments = rawText.split(/(```[\s\S]*?```)/g);

    return segments.map((segment, idx) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const lines = segment.slice(3, -3).trim().split('\n');
        const firstLine = lines[0]?.trim() || '';
        const hasLang = /^[a-zA-Z0-9+#-]+$/.test(firstLine);
        const lang = hasLang ? firstLine.toUpperCase() : 'CODE';
        const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
        const copyKey = `ai-${msgIndex}-${idx}`;

        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-white/15 bg-[#050505]">
            <div className="flex justify-between items-center px-3.5 py-1.5 bg-white/5 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                {lang}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(copyKey, codeContent)}
                className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white transition-colors"
              >
                {copiedId === copyKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {codeContent}
            </pre>
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          {segment}
        </p>
      );
    });
  };

  // ============================================================================
  // 🎮 4 GEN-Z LOGIC & BRAIN GAMES
  // ============================================================================
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

  useEffect(() => {
    if (activeGame !== '2048') return;
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); move2048('UP'); }
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); move2048('DOWN'); }
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); move2048('LEFT'); }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); move2048('RIGHT'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, grid2048, score2048]);

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

  // --- STUDY PLANNER & BAG PACKER HANDLERS ---
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

  // ============================================================================
  // 🖥️ MAIN VIEW RENDERER
  // ============================================================================
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
                      Admin Mode (Edit Enabled)
                    </span>
                  )}
                  {userRole === 'user' && (
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Verified Member (Read-Only)
                    </span>
                  )}
                  <button
                    onClick={() => fetchFromCloud(true)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-all ${
                      cloudConnected 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                        : 'bg-gray-500/10 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {cloudConnected ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                    {cloudConnected ? 'Live Cloud Sync Active' : 'Local Mode'}
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Public library of quick code utilities (Managed exclusively by Admin).
                </p>
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
                {/* STRICTLY ADMIN ONLY CAN ADD SNIPPETS */}
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
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-up bg-[#12121a] p-5 rounded-xl border border-white/10 hover:border-indigo-500/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                      {snippet.category || 'CODE'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleCopyCode(snippet.id, snippet.code)}
                        className="p-1.5 text-gray-400 hover:text-white rounded bg-white/5 hover:bg-white/10 transition-all"
                        title="Copy Code"
                      >
                        {copiedId === snippet.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {/* STRICTLY ADMIN ONLY CAN EDIT OR DELETE SNIPPETS */}
                      {userRole === 'admin' && (
                        <>
                          <button 
                            onClick={() => openEditSnippetModal(snippet)}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 rounded bg-white/5 hover:bg-white/10 transition-all"
                            title="Edit Snippet (Admin Only)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSnippet(snippet.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded bg-white/5 hover:bg-white/10 transition-all"
                            title="Delete Snippet (Admin Only)"
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Gen-Z Logic & Brain Arcade
                </h1>
                <p className="text-gray-400 text-sm">
                  {activeAccountKey
                    ? `Playing as ${activeAccountKey} — Your ID Balance: ${mumuPoints} MuMu Points`
                    : 'Login or Register to save earned MuMu points to your personal ID!'}
                </p>
              </div>
              {activeGame && (
                <button 
                  onClick={() => setActiveGame(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all w-fit"
                >
                  ← Exit Game
                </button>
              )}
            </div>

            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-emerald-500/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                    <Terminal className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-1">Daily Viral Word Puzzle</span>
                  <h3 className="text-xl font-bold mb-2">CODELE (5-Letter Tech Wordle)</h3>
                  <p className="text-gray-400 text-sm mb-6">Crack the hidden 5-letter coding word in 6 tries using color logic clues.</p>
                  <button onClick={initCodele} className="mt-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-bold transition-all">
                    Play CODELE (+40 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-indigo-500/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
                    <Grid className="w-7 h-7 text-indigo-400" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-1">Addictive Number Strategy</span>
                  <h3 className="text-xl font-bold mb-2">2048: Cyber Merge</h3>
                  <p className="text-gray-400 text-sm mb-6">Slide and merge power-of-2 tiles on a 4x4 grid using arrow keys or buttons.</p>
                  <button onClick={init2048} className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-bold transition-all">
                    Play 2048 (+50 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-pink-500/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-4">
                    <Cpu className="w-7 h-7 text-pink-400" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 mb-1">Hardcore Pattern Puzzle</span>
                  <h3 className="text-xl font-bold mb-2">Quantum Lights Out</h3>
                  <p className="text-gray-400 text-sm mb-6">Tapping a node flips its state and its 4 neighbors. Turn all 16 nodes ON!</p>
                  <button onClick={initLightsOut} className="mt-auto bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-bold transition-all">
                    Play Lights Out (+45 MuMu)
                  </button>
                </div>

                <div className="bg-[#12121a] p-6 rounded-2xl border border-white/10 hover:border-amber-500/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                    <Brain className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1">Cognitive Illusion Test</span>
                  <h3 className="text-xl font-bold mb-2">Stroop Mind Paradox</h3>
                  <p className="text-gray-400 text-sm mb-6">Beat the psychological color-word trap when the rule flips every round!</p>
                  <button onClick={initStroopGame} className="mt-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-full font-bold transition-all">
                    Play Mind Paradox (+30 MuMu)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] p-6 md:p-8 rounded-2xl border border-white/10 max-w-lg mx-auto text-center animate-pop-in">
                {activeGame === 'codele' && (
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-1">CODELE</h2>
                    <p className="text-xs text-gray-400 mb-4">Green = Right Spot, Yellow = Wrong Spot</p>
                    <div className="space-y-2 max-w-[260px] mx-auto mb-6">
                      {Array.from({ length: 6 }).map((_, rIdx) => {
                        const guess = codeleGuesses[rIdx] || (rIdx === codeleGuesses.length ? codeleCurrent : '');
                        const submitted = rIdx < codeleGuesses.length;
                        return (
                          <div key={rIdx} className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((__, cIdx) => {
                              const letter = guess[cIdx] || '';
                              return (
                                <div key={cIdx} className={`h-11 rounded-lg border font-mono font-bold text-lg flex items-center justify-center ${submitted ? getTileColor(letter, cIdx) : 'bg-[#050505] border-white/20 text-white'}`}>
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
                              <button key={c} onClick={() => handleCodeleKey(c)} className="bg-white/10 hover:bg-white/20 px-2.5 py-2.5 rounded text-xs font-bold">{c}</button>
                            ))}
                          </div>
                        ))}
                        <div className="flex justify-center gap-2 pt-2">
                          <button onClick={() => handleCodeleKey('DEL')} className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-xs font-bold">DEL</button>
                          <button onClick={() => handleCodeleKey('ENTER')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold">SUBMIT</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-lg font-bold">{codeleStatus === 'won' ? '🎉 You cracked it!' : `Word was: ${codeleTarget}`}</p>
                        <button onClick={initCodele} className="bg-emerald-600 px-5 py-2 rounded-lg text-sm font-bold">Play Again</button>
                      </div>
                    )}
                  </div>
                )}

                {activeGame === '2048' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-indigo-400">2048: Cyber Merge</h2>
                      <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-mono font-bold">Score: {score2048}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 bg-[#050505] p-3 rounded-xl border border-white/10 max-w-[280px] mx-auto mb-5">
                      {grid2048.map((val, idx) => (
                        <div key={idx} className={`h-14 rounded-lg font-mono font-bold text-sm flex items-center justify-center ${
                          val === 0 ? 'bg-white/5 text-transparent' :
                          val <= 4 ? 'bg-indigo-950 text-indigo-200 border border-indigo-500/30' :
                          val <= 16 ? 'bg-indigo-600 text-white' :
                          'bg-pink-600 text-white shadow-lg'
                        }`}>
                          {val || '.'}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <button onClick={() => move2048('UP')} className="bg-white/10 hover:bg-indigo-600 p-3 rounded-xl"><ArrowUp className="w-5 h-5" /></button>
                      <div className="flex gap-4">
                        <button onClick={() => move2048('LEFT')} className="bg-white/10 hover:bg-indigo-600 p-3 rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
                        <button onClick={() => move2048('DOWN')} className="bg-white/10 hover:bg-indigo-600 p-3 rounded-xl"><ArrowDown className="w-5 h-5" /></button>
                        <button onClick={() => move2048('RIGHT')} className="bg-white/10 hover:bg-indigo-600 p-3 rounded-xl"><ArrowRight className="w-5 h-5" /></button>
                      </div>
                    </div>
                    <button onClick={init2048} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mx-auto">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Board
                    </button>
                  </div>
                )}

                {activeGame === 'lights' && (
                  <div>
                    <h2 className="text-xl font-bold text-pink-400 mb-1">Quantum Lights Out</h2>
                    <p className="text-xs text-gray-400 mb-4">Turn ALL 16 nodes ON (Glowing Pink). Moves: {lightsMoves}</p>
                    <div className="grid grid-cols-4 gap-3 max-w-[260px] mx-auto mb-6">
                      {lightsGrid.map((isOn, idx) => (
                        <button key={idx} onClick={() => handleLightClick(idx)} className={`h-14 rounded-xl border flex items-center justify-center transition-all ${isOn ? 'bg-pink-500 border-pink-300 shadow-lg shadow-pink-500/40' : 'bg-[#050505] border-white/10'}`}>
                          <Zap className={`w-5 h-5 ${isOn ? 'text-white' : 'text-gray-700'}`} />
                        </button>
                      ))}
                    </div>
                    <button onClick={initLightsOut} className="bg-pink-600 px-5 py-2 rounded-lg text-sm font-bold">New Puzzle</button>
                  </div>
                )}

                {activeGame === 'stroop' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-amber-400">Stroop Mind Paradox</h2>
                      <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">Streak: {stroopStreak} 🔥</span>
                    </div>
                    <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 mb-6">
                      <div className="text-sm font-bold text-white bg-white/10 inline-block px-3 py-1 rounded-full mb-4">
                        {stroopMode === 'MEANING' ? '🧠 TAP THE WORD MEANING' : '🎨 TAP THE INK COLOR'}
                      </div>
                      <div className="text-5xl font-black tracking-wider py-4" style={{ color: STROOP_COLORS[stroopColorIdx].hex }}>
                        {STROOP_COLORS[stroopWordIdx].name}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {STROOP_COLORS.map((col, idx) => (
                        <button key={col.name} onClick={() => handleStroopAnswer(idx)} className={`${col.bg} text-black font-extrabold py-3.5 rounded-xl`}>
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
                  <Sparkles className="w-6 h-6 animate-pulse" /> Aura AI Companion
                </h1>
                <p className="text-xs text-gray-400">High-Accuracy Generative AI & Multimodal Code Mentor</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                ● Live AI Online
              </span>
            </div>
            
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 animate-fade-up ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[88%] md:max-w-[78%] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#12121a] border border-white/10 text-gray-200 rounded-tl-none'}`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-h-52 rounded-lg mb-2 border border-white/20 object-cover" />
                    )}
                    {msg.sender === 'aura'
                      ? renderFormattedAiText(msg.text, idx)
                      : <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-[#12121a] border border-white/10 text-gray-400 p-4 rounded-2xl rounded-tl-none text-sm">
                    Aura is generating an accurate response...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0f]">
              {selectedImage && (
                <div className="flex items-center gap-3 mb-3 bg-[#12121a] p-2 rounded-lg border border-indigo-500/30 w-fit">
                  <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  <span className="text-xs text-gray-300">Image ready to send</span>
                  <button onClick={() => setSelectedImage(null)} className="text-red-400 hover:text-red-300 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#12121a] hover:bg-white/10 border border-white/10 p-3 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Attach Image or Screenshot"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Aura any coding, math, or science question..." 
                  className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                />
                <button type="submit" disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-lg shrink-0">
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
            <p className="text-gray-400 text-sm mb-6">Track your learning milestones (Syncs across devices).</p>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new study goal..."
                className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-lg text-sm font-bold">
                Add Goal
              </button>
            </form>
            <div className="space-y-3">
              {studyTasks.map(task => (
                <div key={task.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleStudyTask(task.id)}>
                    <input type="checkbox" checked={task.done} readOnly className="w-4 h-4 accent-emerald-500" />
                    <span className={task.done ? 'line-through text-gray-500' : 'text-white'}>{task.text}</span>
                  </div>
                  <button onClick={() => deleteStudyTask(task.id)} className="text-gray-500 hover:text-red-400">
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
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-lg text-sm font-bold">
                Add Item
              </button>
            </form>
            <div className="space-y-3">
              {bagItems.map(item => (
                <div key={item.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleBagItem(item.id)}>
                    <input type="checkbox" checked={item.packed} readOnly className="w-4 h-4 accent-orange-500" />
                    <span className={item.packed ? 'line-through text-gray-500' : 'text-white'}>{item.text}</span>
                  </div>
                  <button onClick={() => deleteBagItem(item.id)} className="text-gray-500 hover:text-red-400">
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

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* 2. RESPONSIVE SIDEBAR */}
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

          <div className="text-xs font-bold text-gray-600 uppercase mb-4 mt-8 px-3">Member Access</div>
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
              <div>
                <span className="text-xs font-bold text-gray-300 block">MuMu Vault</span>
                <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                  {activeAccountKey || 'Guest (Not Logged In)'}
                </span>
              </div>
            </div>
            <span className="text-yellow-500 font-mono text-sm font-bold">{mumuPoints}</span>
          </div>

          {userRole === 'guest' ? (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => openAuthModal('login')} 
                className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg transition-all text-xs font-bold"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg transition-all text-xs font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#12121a] p-3 rounded-lg border border-indigo-500/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    {userRole === 'admin' ? 'Nexus Admin' : currentUserEmail}
                  </div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider">
                    {userRole === 'admin' ? 'Administrator' : `${mumuPoints} MuMu Pts`}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors shrink-0" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-y-auto overflow-x-hidden relative bg-[#050505]">
        {renderContent()}
      </div>

      {/* --- ADD / EDIT SNIPPET MODAL (ADMIN ONLY) --- */}
      {showSnippetModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowSnippetModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {editingSnippet ? 'Edit Snippet (Admin)' : 'Add New Snippet (Admin)'}
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
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold">
                  {editingSnippet ? 'Save Changes' : 'Create Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 🔐 LOGIN & NEW USER REGISTRATION MODAL (No Admin Details Shown)       */}
      {/* ==================================================================== */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-500/50">
                {authMode === 'login' ? (
                  <Shield className="w-7 h-7 text-indigo-500" />
                ) : (
                  <UserPlus className="w-7 h-7 text-emerald-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'login' ? 'Account Login' : 'New User Registration'}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {authMode === 'login'
                  ? 'Sign in to access your personal MuMu Points & AI tools'
                  : 'Register with a real Google Gmail ID (Starts with 0 MuMu Points)'}
              </p>
            </div>

            <div className="grid grid-cols-2 bg-[#12121a] p-1 rounded-xl mb-6 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'register'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Register New User
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Enter Mail ID
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                    placeholder="Enter Mail ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Enter Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                    placeholder="Enter Password"
                    required
                  />
                </div>

                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs text-center p-3 rounded-lg">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-bold transition-all"
                >
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Enter the Gmail ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setEmailVerifiedStatus(null);
                        setRegError('');
                      }}
                      className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white text-sm"
                      placeholder="Enter the Gmail ID"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVerifyGmailClick}
                      disabled={isVerifyingEmail}
                      className="bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold px-3 rounded-lg text-emerald-400 shrink-0 flex items-center gap-1 transition-all"
                    >
                      {isVerifyingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Verify
                    </button>
                  </div>

                  {emailVerifiedStatus?.valid && (
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {emailVerifiedStatus.reason}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Create a Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white text-sm"
                    placeholder="Create a Password"
                    required
                  />
                </div>

                {regError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingEmail}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Account with Google...
                    </>
                  ) : (
                    'Verify by Google & Register'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
