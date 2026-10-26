import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sparkles, Terminal, Code, Cpu, Trophy, User, 
  LogIn, Lock, Menu, X, LogOut, Plus, Search, Send, Play, 
  CheckSquare, Briefcase, Trash2, Edit2, Copy, Check, 
  Zap, Grid, RotateCcw, Paperclip, Cloud, CloudOff,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Brain, RefreshCw,
  UserPlus, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, 
  MessageSquare, FolderLock, ExternalLink, Bell, Clock, Calendar, AlertTriangle
} from 'lucide-react';

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

function emailToFirebaseKey(email) {
  if (!email) return '';
  return email.trim().toLowerCase().replace(/\./g, '_dot_').replace(/@/g, '_at_').replace(/[^a-z0-9_]/g, '_');
}

const DEFAULT_SNIPPETS = [
  { id: 1, title: 'Center a Div', category: 'CSS', code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
  { id: 2, title: 'Fetch API Wrapper', category: 'JS', code: 'const fetcher = url => fetch(url).then(r => r.json());' },
  { 
    id: 3, 
    title: 'Full Async API Handler with Retry', 
    category: 'JS', 
    code: 'async function fetchWithRetry(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const response = await fetch(url);\n      if (!response.ok) throw new Error("HTTP Error");\n      return await response.json();\n    } catch (err) {\n      if (i === retries - 1) throw err;\n      await new Promise(r => setTimeout(r, 1000));\n    }\n  }\n}' 
  }
];

const DEFAULT_TASKS = [
  { id: 1, text: 'Review React Hooks & State', done: false, hasDeadline: false },
  { id: 2, text: 'Practice Data Structures & Algorithms', done: true, hasDeadline: false }
];

const DEFAULT_BAG = [
  { id: 1, text: 'Laptop & Charger', packed: true },
  { id: 2, text: 'ID Card & Notebook', packed: false }
];

const REMINDER_PRESETS = [
  { label: '1 Day', minutes: 1440 },
  { label: '12 Hrs', minutes: 720 },
  { label: '6 Hrs', minutes: 360 },
  { label: '3 Hrs', minutes: 180 },
  { label: '2 Hrs', minutes: 120 },
  { label: '1 Hr', minutes: 60 },
  { label: '30 Min', minutes: 30 },
  { label: '15 Min', minutes: 15 },
  { label: 'Custom', minutes: 'custom' }
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

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

function formatLeadTime(mins) {
  if (!mins || mins <= 0) return 'At deadline';
  if (mins >= 1440 && mins % 1440 === 0) return `${mins / 1440}d before`;
  if (mins >= 60 && mins % 60 === 0) return `${mins / 60}h before`;
  if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m before`;
  return `${mins}m before`;
}

async function verifyGmailWithGoogle(rawEmail, existingUsers = []) {
  const email = rawEmail.trim().toLowerCase();
  const parts = email.split('@');
  if (parts.length !== 2 || parts[1] !== 'gmail.com' || !parts[0]) {
    return { valid: false, reason: 'Google Verification Failed: Please enter a valid @gmail.com address.' };
  }

  const username = parts[0];
  if (username.length < 6 || username.length > 30) {
    return { valid: false, reason: 'Google Verification Failed: This Gmail account does not exist (usernames must be 6–30 characters).' };
  }

  if (!/^[a-z0-9.]+$/.test(username)) {
    return { valid: false, reason: 'Google Verification Failed: Invalid characters in Gmail address.' };
  }

  if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
    return { valid: false, reason: 'Google Verification Failed: Invalid period placement in Gmail address.' };
  }

  const cleanUser = username.replace(/\./g, '');
  const lettersOnly = cleanUser.replace(/[^a-z]/g, '');
  const digitsOnly = cleanUser.replace(/[^0-9]/g, '');

  if (!/^[a-z]/.test(cleanUser) || lettersOnly.length < 4) {
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

  if (digitsOnly.length > lettersOnly.length || digitsOnly.length > 6) {
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

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
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

  if (/(.)\1{2,}/.test(cleanUser) || /[a-z]\d[a-z]\d/.test(cleanUser)) {
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

  const vowels = (lettersOnly.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowels / lettersOnly.length;

  if (vowelRatio < 0.22 || vowelRatio > 0.75) {
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

  if (
    /[bcdfghjklmnpqrstvwxz]{5,}/.test(lettersOnly) || 
    /[jqwxz]{2,}/.test(lettersOnly) || 
    /[bcdfghjklmnpqrstvwxz]{4}$/.test(lettersOnly)
  ) {
    return { valid: false, reason: 'Google Verification Failed: Account does not exist on Google.' };
  }

  if (existingUsers.some((u) => u.email.toLowerCase() === email)) {
    return { valid: true, email, reason: 'Verified Google Account' };
  }

  try {
    const disifyRes = await fetch(`https://disify.com/api/email/${encodeURIComponent(email)}`);
    if (disifyRes.ok) {
      const disifyData = await disifyRes.json();
      if (disifyData.format === false || disifyData.dns === false || disifyData.disposable === true) {
        return { valid: false, reason: 'Google Verification Failed: Account is undeliverable or disposable.' };
      }
    }
  } catch {}

  return { valid: true, email, reason: 'Verified: Active Google Gmail Account Confirmed' };
}

export default function App() {
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

  const [userPointsMap, setUserPointsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_points_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [userPersonalSnippetsMap, setUserPersonalSnippetsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_personal_snippets_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [userTasksMap, setUserTasksMap] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_tasks_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [userBagMap, setUserBagMap] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_bag_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [feedbackList, setFeedbackList] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_feedback_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [newFeedbackText, setNewFeedbackText] = useState('');

  const activeEmail = userRole === 'admin'
    ? 'admin@nexus.com'
    : userRole === 'user' && currentUserEmail
      ? currentUserEmail.trim().toLowerCase()
      : null;

  const activeSafeKey = activeEmail ? emailToFirebaseKey(activeEmail) : null;

  const getPointsForEmail = (emailStr) => {
    if (!emailStr) return 0;
    const clean = emailStr.trim().toLowerCase();
    const safeKey = emailToFirebaseKey(clean);
    if (typeof userPointsMap[safeKey] === 'number') return userPointsMap[safeKey];
    if (typeof userPointsMap[clean] === 'number') return userPointsMap[clean];
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === clean);
    if (foundUser && typeof foundUser.points === 'number') return foundUser.points;
    return 0;
  };

  const getPersonalSnippetsForEmail = (emailStr) => {
    if (!emailStr) return [];
    const clean = emailStr.trim().toLowerCase();
    const safeKey = emailToFirebaseKey(clean);
    const entry = userPersonalSnippetsMap[safeKey] ?? userPersonalSnippetsMap[clean];
    if (entry !== undefined && entry !== null) {
      if (Array.isArray(entry)) return entry;
      if (typeof entry === 'object') return Array.isArray(entry.items) ? entry.items : [];
    }
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === clean);
    if (foundUser && Array.isArray(foundUser.personalSnippets)) {
      return foundUser.personalSnippets;
    }
    return [];
  };

  const getTasksForEmail = (emailStr) => {
    if (!emailStr) return DEFAULT_TASKS;
    const clean = emailStr.trim().toLowerCase();
    const safeKey = emailToFirebaseKey(clean);
    const entry = userTasksMap[safeKey] ?? userTasksMap[clean];
    if (entry !== undefined && entry !== null) {
      if (Array.isArray(entry)) return entry;
      if (typeof entry === 'object') return Array.isArray(entry.items) ? entry.items : [];
    }
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === clean);
    if (foundUser && foundUser.tasksInitialized) {
      return Array.isArray(foundUser.studyTasks) ? foundUser.studyTasks : [];
    }
    return DEFAULT_TASKS;
  };

  const getBagForEmail = (emailStr) => {
    if (!emailStr) return DEFAULT_BAG;
    const clean = emailStr.trim().toLowerCase();
    const safeKey = emailToFirebaseKey(clean);
    const entry = userBagMap[safeKey] ?? userBagMap[clean];
    if (entry !== undefined && entry !== null) {
      if (Array.isArray(entry)) return entry;
      if (typeof entry === 'object') return Array.isArray(entry.items) ? entry.items : [];
    }
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === clean);
    if (foundUser && foundUser.bagInitialized) {
      return Array.isArray(foundUser.bagItems) ? foundUser.bagItems : [];
    }
    return DEFAULT_BAG;
  };

  const mumuPoints = activeEmail ? getPointsForEmail(activeEmail) : 0;
  const currentPersonalSnippets = activeEmail ? getPersonalSnippetsForEmail(activeEmail) : [];
  const currentStudyTasks = activeEmail ? getTasksForEmail(activeEmail) : DEFAULT_TASKS;
  const currentBagItems = activeEmail ? getBagForEmail(activeEmail) : DEFAULT_BAG;

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('nexus_active_tab') || 'snippetHub');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [toast, setToast] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState({});

  const [snippets, setSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_snippets');
      return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
    } catch {
      return DEFAULT_SNIPPETS;
    }
  });

  const stateRef = useRef({
    snippets,
    userPersonalSnippetsMap,
    userTasksMap,
    userBagMap,
    userPointsMap,
    registeredUsers,
    feedbackList
  });
  const lastLocalWriteRef = useRef(0);

  useEffect(() => {
    stateRef.current = {
      snippets,
      userPersonalSnippetsMap,
      userTasksMap,
      userBagMap,
      userPointsMap,
      registeredUsers,
      feedbackList
    };
  }, [snippets, userPersonalSnippetsMap, userTasksMap, userBagMap, userPointsMap, registeredUsers, feedbackList]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerifiedStatus, setEmailVerifiedStatus] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetModalTarget, setSnippetModalTarget] = useState('public');
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCategory, setSnippetCategory] = useState('GENERAL');
  const [snippetCode, setSnippetCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { 
      sender: 'aura', 
      text: "Hello! I am Aura, your AI assistant. I am an AI, so I can make mistakes—please review code and important information carefully. How can I help you today?" 
    }
  ]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [newTaskText, setNewTaskText] = useState('');
  const [taskHasDeadline, setTaskHasDeadline] = useState(false);
  const [taskDeadlineType, setTaskDeadlineType] = useState('simple');
  const [taskDeadlineDateTime, setTaskDeadlineDateTime] = useState('');
  const [taskReminderPreset, setTaskReminderPreset] = useState(60);
  const [customReminderValue, setCustomReminderValue] = useState(45);
  const [customReminderUnit, setCustomReminderUnit] = useState('minutes');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [newBagItem, setNewBagItem] = useState('');

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

  const sanitizePointsMapForFirebase = (rawMap) => {
    const cleanMap = {};
    if (!rawMap || typeof rawMap !== 'object') return cleanMap;
    Object.entries(rawMap).forEach(([k, val]) => {
      const safeK = k.includes('@') || k.includes('.') ? emailToFirebaseKey(k) : k;
      if (safeK && typeof val === 'number') {
        cleanMap[safeK] = val;
      }
    });
    return cleanMap;
  };

  const sanitizeListMapForFirebase = (rawMap) => {
    const cleanMap = {};
    if (!rawMap || typeof rawMap !== 'object') return cleanMap;
    Object.entries(rawMap).forEach(([k, val]) => {
      const safeK = k.includes('@') || k.includes('.') ? emailToFirebaseKey(k) : k;
      if (!safeK) return;
      if (Array.isArray(val)) {
        cleanMap[safeK] = { updatedAt: Date.now(), items: val };
      } else if (val && typeof val === 'object') {
        cleanMap[safeK] = {
          updatedAt: val.updatedAt || Date.now(),
          items: Array.isArray(val.items) ? val.items : []
        };
      }
    });
    return cleanMap;
  };

  const pushToCloud = async (overrideData = {}) => {
    if (!CLEAN_FIREBASE_URL) return;
    lastLocalWriteRef.current = Date.now();
    setIsSyncing(true);

    const safePoints = sanitizePointsMapForFirebase(
      overrideData.userPointsMap ?? stateRef.current.userPointsMap
    );
    const safePersonalSnippetsMap = sanitizeListMapForFirebase(
      overrideData.userPersonalSnippetsMap ?? stateRef.current.userPersonalSnippetsMap
    );
    const safeTasksMap = sanitizeListMapForFirebase(
      overrideData.userTasksMap ?? stateRef.current.userTasksMap
    );
    const safeBagMap = sanitizeListMapForFirebase(
      overrideData.userBagMap ?? stateRef.current.userBagMap
    );

    const payload = {
      snippets: overrideData.snippets ?? stateRef.current.snippets,
      userPersonalSnippetsMap: safePersonalSnippetsMap,
      userTasksMap: safeTasksMap,
      userBagMap: safeBagMap,
      userPointsMap: safePoints,
      registeredUsers: overrideData.registeredUsers ?? stateRef.current.registeredUsers,
      feedbackList: overrideData.feedbackList ?? stateRef.current.feedbackList,
      updatedAt: Date.now()
    };

    try {
      const res = await fetch(`${CLEAN_FIREBASE_URL}/nexus_studio_state.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setCloudConnected(res.ok);
    } catch {
      setCloudConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromCloud = async (manual = false) => {
    if (!CLEAN_FIREBASE_URL) return null;
    if (!manual && Date.now() - lastLocalWriteRef.current < 2000) return null;

    try {
      if (manual) setIsSyncing(true);
      const res = await fetch(`${CLEAN_FIREBASE_URL}/nexus_studio_state.json`);
      if (!res.ok) {
        setCloudConnected(false);
        return null;
      }
      const data = await res.json();
      setCloudConnected(true);

      if (data) {
        if (Array.isArray(data.snippets)) {
          setSnippets(data.snippets);
          localStorage.setItem('nexus_snippets', JSON.stringify(data.snippets));
        }
        if (data.userPersonalSnippetsMap && typeof data.userPersonalSnippetsMap === 'object') {
          setUserPersonalSnippetsMap(data.userPersonalSnippetsMap);
          localStorage.setItem('nexus_user_personal_snippets_map', JSON.stringify(data.userPersonalSnippetsMap));
        }
        if (data.userTasksMap && typeof data.userTasksMap === 'object') {
          setUserTasksMap(data.userTasksMap);
          localStorage.setItem('nexus_user_tasks_map', JSON.stringify(data.userTasksMap));
        }
        if (data.userBagMap && typeof data.userBagMap === 'object') {
          setUserBagMap(data.userBagMap);
          localStorage.setItem('nexus_user_bag_map', JSON.stringify(data.userBagMap));
        }
        if (data.userPointsMap && typeof data.userPointsMap === 'object') {
          setUserPointsMap(data.userPointsMap);
          localStorage.setItem('nexus_user_points_map', JSON.stringify(data.userPointsMap));
        }
        if (Array.isArray(data.registeredUsers)) {
          setRegisteredUsers(data.registeredUsers);
          localStorage.setItem('nexus_registered_users', JSON.stringify(data.registeredUsers));
        }
        if (Array.isArray(data.feedbackList)) {
          setFeedbackList(data.feedbackList);
          localStorage.setItem('nexus_feedback_list', JSON.stringify(data.feedbackList));
        }
        if (manual) showToast('☁️ Synced latest data from cloud!');
        return data;
      } else {
        await pushToCloud();
      }
    } catch {
      setCloudConnected(false);
    } finally {
      if (manual) setIsSyncing(false);
    }
    return null;
  };

  useEffect(() => {
    if (!CLEAN_FIREBASE_URL) return;
    fetchFromCloud();
    const interval = setInterval(() => fetchFromCloud(false), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => localStorage.setItem('nexus_user_role', userRole), [userRole]);
  useEffect(() => localStorage.setItem('nexus_user_email', currentUserEmail), [currentUserEmail]);
  useEffect(() => localStorage.setItem('nexus_registered_users', JSON.stringify(registeredUsers)), [registeredUsers]);
  useEffect(() => localStorage.setItem('nexus_user_points_map', JSON.stringify(userPointsMap)), [userPointsMap]);
  useEffect(() => localStorage.setItem('nexus_user_personal_snippets_map', JSON.stringify(userPersonalSnippetsMap)), [userPersonalSnippetsMap]);
  useEffect(() => localStorage.setItem('nexus_user_tasks_map', JSON.stringify(userTasksMap)), [userTasksMap]);
  useEffect(() => localStorage.setItem('nexus_user_bag_map', JSON.stringify(userBagMap)), [userBagMap]);
  useEffect(() => localStorage.setItem('nexus_feedback_list', JSON.stringify(feedbackList)), [feedbackList]);
  useEffect(() => localStorage.setItem('nexus_active_tab', activeTab), [activeTab]);
  useEffect(() => localStorage.setItem('nexus_snippets', JSON.stringify(snippets)), [snippets]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const requestBrowserNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (Notification.permission === 'granted') {
      setNotifPermission('granted');
      return 'granted';
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        showToast('🔔 Browser Push Notifications Enabled!');
      }
      return perm;
    } catch {
      return 'default';
    }
  };

  const triggerProfessionalAlert = (task) => {
    playNotificationChime();
    const formattedDeadline = new Date(task.deadline).toLocaleString();
    const alertObj = {
      id: `${task.id}-${Date.now()}`,
      taskId: task.id,
      title: 'Upcoming Task Deadline Reminder',
      taskText: task.text,
      deadlineText: formattedDeadline,
      leadLabel: formatLeadTime(task.reminderMinutes)
    };
    setActiveAlerts((prev) => [alertObj, ...prev]);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('⏰ Nexus TaskFlow Reminder', {
          body: `"${task.text}" is due at ${formattedDeadline} (${formatLeadTime(task.reminderMinutes)} alert).`,
          tag: `nexus-task-${task.id}`
        });
      } catch {}
    }
  };

  useEffect(() => {
    if (!activeEmail || !activeSafeKey) return;
    const checkReminders = () => {
      const now = Date.now();
      let changed = false;
      const updatedTasks = currentStudyTasks.map((task) => {
        if (
          !task.done &&
          task.hasDeadline &&
          task.deadlineType === 'reminder' &&
          task.deadline &&
          !task.reminderSent
        ) {
          const deadlineMs = new Date(task.deadline).getTime();
          const offsetMs = (Number(task.reminderMinutes) || 0) * 60 * 1000;
          const triggerAtMs = deadlineMs - offsetMs;
          if (now >= triggerAtMs) {
            changed = true;
            triggerProfessionalAlert(task);
            return { ...task, reminderSent: true };
          }
        }
        return task;
      });

      if (changed) {
        syncUserTasks(updatedTasks);
      }
    };

    checkReminders();
    const timer = setInterval(checkReminders, 10000);
    return () => clearInterval(timer);
  }, [activeEmail, currentStudyTasks]);

  const awardPoints = (amount, label = 'Bonus') => {
    if (!activeEmail || !activeSafeKey) {
      showToast('🔒 Please Login or Register to save MuMu points to your ID!');
      openAuthModal('login');
      return;
    }

    const currentPts = getPointsForEmail(activeEmail);
    const nextPts = currentPts + amount;

    const updatedMap = {
      ...sanitizePointsMapForFirebase(userPointsMap),
      [activeSafeKey]: nextPts
    };

    const updatedUsers = registeredUsers.map((u) =>
      u.email.toLowerCase() === activeEmail ? { ...u, points: nextPts } : u
    );

    setUserPointsMap(updatedMap);
    setRegisteredUsers(updatedUsers);
    pushToCloud({ userPointsMap: updatedMap, registeredUsers: updatedUsers });
    showToast(`+${amount} MuMu Points synced to ${activeEmail}! (${label})`);
  };

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailInput = loginEmail.trim().toLowerCase();

    const latestCloud = await fetchFromCloud(true);
    const activeUsersList = Array.isArray(latestCloud?.registeredUsers)
      ? latestCloud.registeredUsers
      : registeredUsers;
    const activeCloudPointsMap = latestCloud?.userPointsMap || userPointsMap;
    const activeCloudPersonalMap = latestCloud?.userPersonalSnippetsMap || userPersonalSnippetsMap;
    const activeCloudTasksMap = latestCloud?.userTasksMap || userTasksMap;
    const activeCloudBagMap = latestCloud?.userBagMap || userBagMap;

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

    const matchedUser = activeUsersList.find(
      (u) => u.email.toLowerCase() === emailInput && u.password === loginPassword
    );

    if (matchedUser) {
      const cleanId = matchedUser.email.toLowerCase();
      const safeKey = emailToFirebaseKey(cleanId);
      const userPts =
        typeof activeCloudPointsMap[safeKey] === 'number'
          ? activeCloudPointsMap[safeKey]
          : typeof matchedUser.points === 'number'
            ? matchedUser.points
            : 0;

      const syncedPointsMap = {
        ...sanitizePointsMapForFirebase(activeCloudPointsMap),
        [safeKey]: userPts
      };

      const existingPersonalEntry = activeCloudPersonalMap[safeKey];
      const userPersonalList = existingPersonalEntry !== undefined
        ? (Array.isArray(existingPersonalEntry) ? existingPersonalEntry : (existingPersonalEntry.items || []))
        : (Array.isArray(matchedUser.personalSnippets) ? matchedUser.personalSnippets : []);

      const existingTasksEntry = activeCloudTasksMap[safeKey];
      const userTasks = existingTasksEntry !== undefined
        ? (Array.isArray(existingTasksEntry) ? existingTasksEntry : (existingTasksEntry.items || []))
        : (matchedUser.tasksInitialized ? (matchedUser.studyTasks || []) : DEFAULT_TASKS);

      const existingBagEntry = activeCloudBagMap[safeKey];
      const userBag = existingBagEntry !== undefined
        ? (Array.isArray(existingBagEntry) ? existingBagEntry : (existingBagEntry.items || []))
        : (matchedUser.bagInitialized ? (matchedUser.bagItems || []) : DEFAULT_BAG);

      const syncedPersonalMap = {
        ...sanitizeListMapForFirebase(activeCloudPersonalMap),
        [safeKey]: { updatedAt: Date.now(), items: userPersonalList }
      };

      const syncedTasksMap = {
        ...sanitizeListMapForFirebase(activeCloudTasksMap),
        [safeKey]: { updatedAt: Date.now(), items: userTasks }
      };

      const syncedBagMap = {
        ...sanitizeListMapForFirebase(activeCloudBagMap),
        [safeKey]: { updatedAt: Date.now(), items: userBag }
      };

      setUserPointsMap(syncedPointsMap);
      setUserPersonalSnippetsMap(syncedPersonalMap);
      setUserTasksMap(syncedTasksMap);
      setUserBagMap(syncedBagMap);
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
    const latestCloud = await fetchFromCloud(true);
    const currentUsersList = Array.isArray(latestCloud?.registeredUsers)
      ? latestCloud.registeredUsers
      : registeredUsers;
    const currentCloudPoints = latestCloud?.userPointsMap || userPointsMap;
    const currentCloudPersonal = latestCloud?.userPersonalSnippetsMap || userPersonalSnippetsMap;
    const currentCloudTasks = latestCloud?.userTasksMap || userTasksMap;
    const currentCloudBag = latestCloud?.userBagMap || userBagMap;

    const verification = await verifyGmailWithGoogle(regEmail, currentUsersList);
    setIsVerifyingEmail(false);
    setEmailVerifiedStatus(verification);

    if (!verification.valid) {
      setRegError(verification.reason);
      return;
    }

    const cleanMail = verification.email.toLowerCase();
    const safeKey = emailToFirebaseKey(cleanMail);

    if (
      cleanMail === 'admin@nexus.com' ||
      currentUsersList.some((u) => u.email.toLowerCase() === cleanMail)
    ) {
      setRegError('This Gmail ID is already registered. Please switch to Login.');
      return;
    }

    const newUser = {
      email: cleanMail,
      password: regPassword,
      points: 0,
      personalSnippets: [],
      studyTasks: DEFAULT_TASKS,
      tasksInitialized: true,
      bagItems: DEFAULT_BAG,
      bagInitialized: true,
      createdAt: Date.now()
    };

    const updatedUsers = [...currentUsersList, newUser];
    const updatedPointsMap = {
      ...sanitizePointsMapForFirebase(currentCloudPoints),
      [safeKey]: 0
    };
    const updatedPersonalMap = {
      ...sanitizeListMapForFirebase(currentCloudPersonal),
      [safeKey]: { updatedAt: Date.now(), items: [] }
    };
    const updatedTasksMap = {
      ...sanitizeListMapForFirebase(currentCloudTasks),
      [safeKey]: { updatedAt: Date.now(), items: DEFAULT_TASKS }
    };
    const updatedBagMap = {
      ...sanitizeListMapForFirebase(currentCloudBag),
      [safeKey]: { updatedAt: Date.now(), items: DEFAULT_BAG }
    };

    setRegisteredUsers(updatedUsers);
    setUserPointsMap(updatedPointsMap);
    setUserPersonalSnippetsMap(updatedPersonalMap);
    setUserTasksMap(updatedTasksMap);
    setUserBagMap(updatedBagMap);

    await pushToCloud({
      registeredUsers: updatedUsers,
      userPointsMap: updatedPointsMap,
      userPersonalSnippetsMap: updatedPersonalMap,
      userTasksMap: updatedTasksMap,
      userBagMap: updatedBagMap
    });

    setUserRole('user');
    setCurrentUserEmail(cleanMail);
    setShowLogin(false);
    setRegEmail('');
    setRegPassword('');
    setEmailVerifiedStatus(null);
    showToast(`✅ Registered ${cleanMail}! Personal Vault & TaskFlow initialized.`);
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentUserEmail('');
    setActiveTab('snippetHub');
    setIsMobileMenuOpen(false);
    showToast('🔒 Logged out.');
  };

  const syncUserPersonalSnippets = (nextPersonalList) => {
    if (!activeEmail || !activeSafeKey) return;
    const updatedPersonalMap = {
      ...sanitizeListMapForFirebase(userPersonalSnippetsMap),
      [activeSafeKey]: { updatedAt: Date.now(), items: nextPersonalList }
    };
    const updatedUsers = registeredUsers.map((u) =>
      u.email.toLowerCase() === activeEmail
        ? { ...u, personalSnippets: nextPersonalList }
        : u
    );
    setUserPersonalSnippetsMap(updatedPersonalMap);
    setRegisteredUsers(updatedUsers);
    pushToCloud({ userPersonalSnippetsMap: updatedPersonalMap, registeredUsers: updatedUsers });
  };

  const openAddSnippetModal = (target = 'public') => {
    if (target === 'public' && userRole !== 'admin') return;
    if (target === 'personal' && !activeEmail) {
      openAuthModal('login');
      return;
    }
    setSnippetModalTarget(target);
    setEditingSnippet(null);
    setSnippetTitle('');
    setSnippetCategory('GENERAL');
    setSnippetCode('');
    setShowSnippetModal(true);
  };

  const openEditSnippetModal = (snippet, target = 'public') => {
    if (target === 'public' && userRole !== 'admin') return;
    if (target === 'personal' && !activeEmail) return;
    setSnippetModalTarget(target);
    setEditingSnippet(snippet);
    setSnippetTitle(snippet.title);
    setSnippetCategory(snippet.category || 'GENERAL');
    setSnippetCode(snippet.code);
    setShowSnippetModal(true);
  };

  const handleSaveSnippet = (e) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetCode.trim()) return;

    if (snippetModalTarget === 'personal') {
      if (!activeEmail) return;
      let updatedPersonal;
      if (editingSnippet) {
        updatedPersonal = currentPersonalSnippets.map(s =>
          s.id === editingSnippet.id
            ? { ...s, title: snippetTitle, category: snippetCategory, code: snippetCode }
            : s
        );
        showToast('🔒 Personal snippet updated & synced to your ID!');
      } else {
        const newPersonal = {
          id: Date.now(),
          title: snippetTitle,
          category: snippetCategory,
          code: snippetCode
        };
        updatedPersonal = [newPersonal, ...currentPersonalSnippets];
        showToast(`🔒 Personal snippet saved to ${activeEmail}!`);
      }
      syncUserPersonalSnippets(updatedPersonal);
      setShowSnippetModal(false);
      return;
    }

    if (userRole !== 'admin') return;
    let updatedPublic;
    if (editingSnippet) {
      updatedPublic = snippets.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, title: snippetTitle, category: snippetCategory, code: snippetCode }
          : s
      );
      showToast('✨ Public snippet updated & synced!');
    } else {
      const newSnippet = {
        id: Date.now(),
        title: snippetTitle,
        category: snippetCategory,
        code: snippetCode
      };
      updatedPublic = [newSnippet, ...snippets];
      showToast('🚀 Public snippet created & synced!');
    }
    setSnippets(updatedPublic);
    pushToCloud({ snippets: updatedPublic });
    setShowSnippetModal(false);
  };

  const handleDeleteSnippet = (id, target = 'public') => {
    if (target === 'personal') {
      if (!activeEmail) return;
      const updatedPersonal = currentPersonalSnippets.filter(s => s.id !== id);
      syncUserPersonalSnippets(updatedPersonal);
      showToast('🗑️ Personal snippet deleted from your ID.');
      return;
    }
    if (userRole !== 'admin') return;
    const updatedPublic = snippets.filter(s => s.id !== id);
    setSnippets(updatedPublic);
    pushToCloud({ snippets: updatedPublic });
    showToast('🗑️ Public snippet deleted.');
  };

  const handleCopyCode = (id, fullCodeText) => {
    navigator.clipboard.writeText(fullCodeText);
    setCopiedId(id);
    showToast('📋 Full content copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSnippetExpand = (id) => {
    setExpandedSnippets((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
      { sender: 'user', text: userMessage || 'Analyze this attached image.', image: currentImage }
    ];
    setChatHistory(updatedHistory);
    setChatInput('');
    setSelectedImage(null);
    setIsAiLoading(true);

    const systemPrompt = `You are Aura, a helpful AI coding assistant and study companion inside Nexus Studio.
Provide clear answers and put code examples inside markdown code blocks (\`\`\`language ... \`\`\`).`;

    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('PASTE_YOUR')) {
      const geminiContents = updatedHistory.slice(-8).map((msg, idx) => {
        const textPrefix = idx === 0 && msg.sender === 'user' ? `${systemPrompt}\n\nUser: ` : '';
        const parts = [{ text: `${textPrefix}${msg.text}` }];
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
                contents: geminiContents,
                generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
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
        } catch {}
      }
    }

    const fallbackModels = ['openai', 'openai-large', 'mistral'];
    for (const fbModel of fallbackModels) {
      try {
        const openAiMessages = [
          { role: 'system', content: systemPrompt },
          ...updatedHistory.slice(-6).map((msg) => {
            if (msg.image) {
              return {
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: [
                  { type: 'text', text: msg.text || 'Analyze this image.' },
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
            model: fbModel,
            temperature: 0.4,
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
      } catch {}
    }

    try {
      const promptQuery = encodeURIComponent(
        `You are Aura, a helpful AI coding assistant. Answer clearly: ${userMessage}`
      );
      const getRes = await fetch(`https://text.pollinations.ai/${promptQuery}`);
      if (getRes.ok) {
        const textReply = await getRes.text();
        if (textReply && textReply.trim()) {
          setChatHistory([...updatedHistory, { sender: 'aura', text: textReply.trim() }]);
          setIsAiLoading(false);
          return;
        }
      }
    } catch {}

    setChatHistory([
      ...updatedHistory,
      {
        sender: 'aura',
        text: '⚠️ Network connection was interrupted. Please check your internet connection and try again.'
      }
    ]);
    setIsAiLoading(false);
  };

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

  const syncUserTasks = (nextTasks) => {
    if (!activeEmail || !activeSafeKey) return;
    const updatedTasksMap = {
      ...sanitizeListMapForFirebase(userTasksMap),
      [activeSafeKey]: { updatedAt: Date.now(), items: nextTasks }
    };
    const updatedUsers = registeredUsers.map((u) =>
      u.email.toLowerCase() === activeEmail
        ? { ...u, studyTasks: nextTasks, tasksInitialized: true }
        : u
    );
    setUserTasksMap(updatedTasksMap);
    setRegisteredUsers(updatedUsers);
    pushToCloud({ userTasksMap: updatedTasksMap, registeredUsers: updatedUsers });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    if (!activeEmail) {
      openAuthModal('login');
      return;
    }

    if (taskHasDeadline && !taskDeadlineDateTime) {
      showToast('⚠️ Please select a deadline date and time.');
      return;
    }

    let reminderMins = 0;
    if (taskHasDeadline && taskDeadlineType === 'reminder') {
      if (taskReminderPreset === 'custom') {
        const val = Math.max(1, Number(customReminderValue) || 15);
        reminderMins = customReminderUnit === 'hours' ? val * 60 : val;
      } else {
        reminderMins = Number(taskReminderPreset) || 60;
      }
      await requestBrowserNotificationPermission();
    }

    const newTaskObj = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
      hasDeadline: taskHasDeadline,
      deadlineType: taskHasDeadline ? taskDeadlineType : 'none',
      deadline: taskHasDeadline ? taskDeadlineDateTime : null,
      reminderMinutes: taskHasDeadline && taskDeadlineType === 'reminder' ? reminderMins : null,
      reminderSent: false
    };

    const updated = [newTaskObj, ...currentStudyTasks];
    syncUserTasks(updated);
    setNewTaskText('');
    setTaskDeadlineDateTime('');
    showToast(
      taskHasDeadline && taskDeadlineType === 'reminder'
        ? `⏰ Task & Reminder (${formatLeadTime(reminderMins)}) synced!`
        : `✅ Task saved & synced to ${activeEmail}!`
    );
  };

  const toggleStudyTask = (id) => {
    if (!activeEmail) return;
    const updated = currentStudyTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    syncUserTasks(updated);
  };

  const deleteStudyTask = (id) => {
    if (!activeEmail) return;
    const updated = currentStudyTasks.filter(t => t.id !== id);
    syncUserTasks(updated);
    showToast('🗑️ Task deleted & synced to your ID!');
  };

  const syncUserBag = (nextBag) => {
    if (!activeEmail || !activeSafeKey) return;
    const updatedBagMap = {
      ...sanitizeListMapForFirebase(userBagMap),
      [activeSafeKey]: { updatedAt: Date.now(), items: nextBag }
    };
    const updatedUsers = registeredUsers.map((u) =>
      u.email.toLowerCase() === activeEmail
        ? { ...u, bagItems: nextBag, bagInitialized: true }
        : u
    );
    setUserBagMap(updatedBagMap);
    setRegisteredUsers(updatedUsers);
    pushToCloud({ userBagMap: updatedBagMap, registeredUsers: updatedUsers });
  };

  const handleAddBagItem = (e) => {
    e.preventDefault();
    if (!newBagItem.trim()) return;
    if (!activeEmail) {
      openAuthModal('login');
      return;
    }
    const updated = [...currentBagItems, { id: Date.now(), text: newBagItem.trim(), packed: false }];
    syncUserBag(updated);
    setNewBagItem('');
    showToast(`🎒 Routine item saved & synced to ${activeEmail}!`);
  };

  const toggleBagItem = (id) => {
    if (!activeEmail) return;
    const updated = currentBagItems.map(b => b.id === id ? { ...b, packed: !b.packed } : b);
    syncUserBag(updated);
  };

  const deleteBagItem = (id) => {
    if (!activeEmail) return;
    const updated = currentBagItems.filter(b => b.id !== id);
    syncUserBag(updated);
    showToast('🗑️ Item deleted & synced to your ID!');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    const latestCloud = await fetchFromCloud(false);
    const currentFeedbacks = Array.isArray(latestCloud?.feedbackList)
      ? latestCloud.feedbackList
      : feedbackList;

    const newEntry = {
      id: Date.now(),
      userEmail: activeEmail || 'Guest User',
      category: feedbackCategory,
      message: newFeedbackText.trim(),
      createdAt: new Date().toLocaleString()
    };

    const updatedFeedback = [newEntry, ...currentFeedbacks];
    setFeedbackList(updatedFeedback);
    await pushToCloud({ feedbackList: updatedFeedback });
    setNewFeedbackText('');
    showToast('✅ Feedback submitted to Admin!');
  };

  const handleDeleteFeedback = async (id) => {
    if (userRole !== 'admin') return;
    const updated = feedbackList.filter((item) => item.id !== id);
    setFeedbackList(updated);
    await pushToCloud({ feedbackList: updated });
    showToast('🗑️ Feedback entry removed.');
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPersonalSnippets = currentPersonalSnippets.filter(s => 
    s.title.toLowerCase().includes(personalSearchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(personalSearchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(personalSearchQuery.toLowerCase()))
  );

  const extractValidUrl = (text) => {
    const trimmed = (text || '').trim();
    if (/^https?:\/\/\S+$/i.test(trimmed)) return trimmed;
    const match = trimmed.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };

  const renderSnippetCards = (list, targetType = 'public') => {
    const canManage = targetType === 'personal' ? Boolean(activeEmail) : userRole === 'admin';

    if (list.length === 0) {
      return (
        <div className="bg-[#12121a] p-8 rounded-2xl border border-white/10 text-center text-gray-400 text-sm">
          {targetType === 'personal'
            ? 'Your Personal Snippet Vault is empty. Click "+ Add My Snippet" above to save your private code, links, or notes!'
            : 'No public snippets found.'}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {list.map((snippet, index) => {
          const codeLines = (snippet.code || '').split('\n');
          const isLongSnippet = codeLines.length > 6 || (snippet.code || '').length > 220;
          const expandKey = `${targetType}-${snippet.id}`;
          const isExpanded = Boolean(expandedSnippets[expandKey]);

          const displayedCode =
            isLongSnippet && !isExpanded
              ? codeLines.slice(0, 6).join('\n').slice(0, 220) + '...'
              : snippet.code;

          const detectedUrl = snippet.category === 'LINK' ? extractValidUrl(snippet.code) : null;

          return (
            <div 
              key={snippet.id} 
              style={{ animationDelay: `${index * 50}ms` }}
              className={`animate-fade-up bg-[#12121a] p-5 rounded-xl border transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl ${
                targetType === 'personal'
                  ? 'border-amber-500/20 hover:border-amber-500/60 hover:shadow-amber-500/10'
                  : 'border-white/10 hover:border-indigo-500/60 hover:shadow-indigo-500/10'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                    targetType === 'personal'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {snippet.category || 'GENERAL'}
                  </span>
                  {targetType === 'personal' && (
                    <span className="text-[10px] font-semibold text-amber-400/80 flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {detectedUrl && (
                    <a
                      href={detectedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-cyan-400 hover:text-cyan-300 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-all flex items-center gap-1 text-xs font-semibold"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </a>
                  )}
                  <button 
                    onClick={() => handleCopyCode(expandKey, snippet.code)}
                    className="px-2 py-1 text-gray-300 hover:text-white rounded bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1 text-xs"
                    title="Copy Full Content"
                  >
                    {copiedId === expandKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  {canManage && (
                    <>
                      <button 
                        onClick={() => openEditSnippetModal(snippet, targetType)}
                        className="p-1.5 text-gray-400 hover:text-indigo-400 rounded bg-white/5 hover:bg-white/10 transition-all"
                        title="Edit Snippet"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSnippet(snippet.id, targetType)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded bg-white/5 hover:bg-white/10 transition-all"
                        title="Delete Snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-3">{snippet.title}</h3>
              <div className="bg-[#050505] rounded-lg border border-white/5 overflow-hidden flex flex-col">
                <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                  {displayedCode}
                </pre>
                {isLongSnippet && (
                  <button
                    type="button"
                    onClick={() => toggleSnippetExpand(expandKey)}
                    className="w-full py-2 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 border-t border-white/5 text-indigo-400 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Read more... <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
                  Public library of code, links, and text utilities (Managed exclusively by Admin).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search public snippets..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {userRole === 'admin' && (
                  <button 
                    onClick={() => openAddSnippetModal('public')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shrink-0 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" /> Add Public Snippet
                  </button>
                )}
              </div>
            </div>

            {renderSnippetCards(filteredSnippets, 'public')}
          </div>
        );

      case 'personalSnippets':
        return (
          <div className="p-4 md:p-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                    <FolderLock className="w-7 h-7 text-amber-400" /> My Personal Snippets
                  </h1>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Private to {activeEmail}
                  </span>
                  <button
                    onClick={() => fetchFromCloud(true)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> Sync My Vault
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Your private vault of snippets, links, and notes—visible only when logged into your account.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={personalSearchQuery}
                    onChange={(e) => setPersonalSearchQuery(e.target.value)}
                    placeholder="Search my snippets..."
                    className="w-full bg-[#12121a] border border-amber-500/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button 
                  onClick={() => openAddSnippetModal('personal')}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-extrabold shrink-0 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" /> Add My Snippet
                </button>
              </div>
            </div>

            {renderSnippetCards(filteredPersonalSnippets, 'personal')}
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
                  {activeEmail
                    ? `Logged in as ${activeEmail} — Your Personal ID Balance: ${mumuPoints} MuMu Points`
                    : 'Login or Register to sync earned MuMu points with your personal Gmail ID!'}
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
                <p className="text-xs text-gray-400">
                  AI Assistant — AI can make mistakes, so please verify important outputs.
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                ● Online
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
                    Aura is thinking...
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
                  placeholder="Ask Aura a question..." 
                  className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-sm"
                />
                <button type="submit" disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-lg shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
              <p className="text-[11px] text-gray-500 text-center mt-2">
                Aura is an AI and can make mistakes. Please double-check important information and code.
              </p>
            </div>
          </div>
        );

      case 'studyPlanner':
        return (
          <div className="p-4 md:p-8 max-w-3xl animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent flex items-center gap-2">
                  <CheckSquare className="w-7 h-7 text-emerald-400" /> TaskFlow To-Do
                </h1>
                <p className="text-gray-400 text-sm">
                  Personal To-Do & Smart Deadline Manager synced to <span className="text-emerald-400 font-semibold">{activeEmail}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestBrowserNotificationPermission}
                    className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" /> Enable Push Alerts
                  </button>
                )}
                <button
                  onClick={() => fetchFromCloud(true)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Tasks
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTask} className="bg-[#12121a] p-5 rounded-2xl border border-white/10 mb-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                  To-Do Task Title
                </label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What do you need to get done?"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                  1. Choose Task Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTaskHasDeadline(false)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      !taskHasDeadline
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#050505] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" /> Without Deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskHasDeadline(true)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      taskHasDeadline
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-[#050505] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" /> With Deadline
                  </button>
                </div>
              </div>

              {taskHasDeadline && (
                <div className="p-4 rounded-xl bg-[#050505] border border-indigo-500/25 space-y-4 animate-fade-up">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                      2. Select Deadline Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTaskDeadlineType('simple')}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          taskDeadlineType === 'simple'
                            ? 'bg-indigo-600/15 border-indigo-500 text-white'
                            : 'bg-[#12121a] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
                          <Calendar className="w-4 h-4" /> Simple Deadline
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Displays the target date and time on your task card.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTaskDeadlineType('reminder')}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          taskDeadlineType === 'reminder'
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#12121a] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center gap-1.5 text-amber-300">
                          <Bell className="w-4 h-4" /> Reminder Deadline
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Sends professional web & push alerts when the deadline is near.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                      Target Deadline Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={taskDeadlineDateTime}
                      onChange={(e) => setTaskDeadlineDateTime(e.target.value)}
                      className="w-full bg-[#12121a] border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required={taskHasDeadline}
                    />
                  </div>

                  {taskDeadlineType === 'reminder' && (
                    <div className="space-y-3 pt-1">
                      <label className="block text-xs font-bold text-amber-300 uppercase">
                        Set Reminder Alert Before Deadline
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {REMINDER_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setTaskReminderPreset(preset.minutes)}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                              taskReminderPreset === preset.minutes
                                ? 'bg-amber-500 text-black border-amber-400 shadow'
                                : 'bg-[#12121a] text-gray-300 border-white/10 hover:border-amber-500/40'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {taskReminderPreset === 'custom' && (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={customReminderValue}
                            onChange={(e) => setCustomReminderValue(e.target.value)}
                            className="w-28 bg-[#12121a] border border-amber-500/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                            placeholder="e.g. 45"
                          />
                          <select
                            value={customReminderUnit}
                            onChange={(e) => setCustomReminderUnit(e.target.value)}
                            className="bg-[#12121a] border border-amber-500/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                          >
                            <option value="minutes">Minutes Before</option>
                            <option value="hours">Hours Before</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" /> Add To-Do Task
              </button>
            </form>

            <div className="space-y-3">
              {currentStudyTasks.length === 0 ? (
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 text-center text-gray-400 text-sm">
                  No tasks in your TaskFlow To-Do list yet. Add a task above!
                </div>
              ) : (
                currentStudyTasks.map((task) => {
                  const isOverdue =
                    !task.done &&
                    task.hasDeadline &&
                    task.deadline &&
                    new Date(task.deadline).getTime() < Date.now();

                  return (
                    <div
                      key={task.id}
                      className={`bg-[#12121a] p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isOverdue ? 'border-red-500/40' : 'border-white/10'
                      }`}
                    >
                      <div
                        className="flex items-start gap-3 cursor-pointer flex-1"
                        onClick={() => toggleStudyTask(task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(task.done)}
                          readOnly
                          className="w-4 h-4 mt-1 accent-emerald-500 shrink-0"
                        />
                        <div className="space-y-1.5">
                          <span className={`block text-sm font-medium ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.text}
                          </span>
                          {task.hasDeadline && task.deadline && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border ${
                                  task.done
                                    ? 'bg-gray-500/10 text-gray-400 border-white/10'
                                    : isOverdue
                                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                Due: {new Date(task.deadline).toLocaleString()}
                                {isOverdue && !task.done ? ' (Overdue)' : ''}
                              </span>

                              {task.deadlineType === 'reminder' && (
                                <span
                                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border ${
                                    task.reminderSent
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  }`}
                                >
                                  <Bell className="w-3 h-3" />
                                  {task.reminderSent
                                    ? 'Reminder Sent'
                                    : `Alert: ${formatLeadTime(task.reminderMinutes)}`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteStudyTask(task.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 self-end sm:self-center"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'bagPacker':
        return (
          <div className="p-4 md:p-8 max-w-3xl animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Routine & Bag Packer</h1>
                <p className="text-gray-400 text-sm">
                  Synced exclusively to your ID: <span className="text-orange-400 font-semibold">{activeEmail}</span>
                </p>
              </div>
              <button
                onClick={() => fetchFromCloud(true)}
                className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync My Routine
              </button>
            </div>

            <form onSubmit={handleAddBagItem} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newBagItem}
                onChange={(e) => setNewBagItem(e.target.value)}
                placeholder="Add routine or item to pack for your ID..."
                className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-lg text-sm font-bold shrink-0">
                Add Item
              </button>
            </form>

            <div className="space-y-3">
              {currentBagItems.length === 0 ? (
                <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 text-center text-gray-400 text-sm">
                  No routine or bag items in your account yet. Add an item above!
                </div>
              ) : (
                currentBagItems.map(item => (
                  <div key={item.id} className="bg-[#12121a] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleBagItem(item.id)}>
                      <input type="checkbox" checked={Boolean(item.packed)} readOnly className="w-4 h-4 accent-orange-500" />
                      <span className={item.packed ? 'line-through text-gray-500' : 'text-white'}>{item.text}</span>
                    </div>
                    <button onClick={() => deleteBagItem(item.id)} className="text-gray-500 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="p-4 md:p-8 max-w-3xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  {userRole === 'admin' ? 'Admin Feedback Inbox' : 'User Feedback'}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {userRole === 'admin'
                    ? 'All feedback submitted by users is displayed below.'
                    : 'Share your thoughts, report bugs, or request features for the Admin.'}
                </p>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={() => fetchFromCloud(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-cyan-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Refresh Inbox
                </button>
              )}
            </div>

            {userRole === 'admin' ? (
              <div className="space-y-4">
                {feedbackList.length === 0 ? (
                  <div className="bg-[#12121a] p-8 rounded-2xl border border-white/10 text-center text-gray-400 text-sm">
                    No user feedback has been submitted yet.
                  </div>
                ) : (
                  feedbackList.map((item) => (
                    <div key={item.id} className="bg-[#12121a] p-5 rounded-xl border border-white/10 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">
                            {item.category || 'Feedback'}
                          </span>
                          <span className="text-xs font-bold text-indigo-400">
                            {item.userEmail}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            • {item.createdAt}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-gray-500 hover:text-red-400 p-1"
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap mt-1 bg-[#050505] p-3.5 rounded-lg border border-white/5">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="bg-[#12121a] p-6 rounded-2xl border border-white/10 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Your Account ID
                  </label>
                  <input
                    type="text"
                    value={activeEmail || 'Guest'}
                    disabled
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="General">General Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Your Feedback
                  </label>
                  <textarea
                    rows={5}
                    value={newFeedbackText}
                    onChange={(e) => setNewFeedbackText(e.target.value)}
                    placeholder="Write your feedback here..."
                    className="w-full bg-[#050505] border border-white/10 rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Feedback
                </button>
              </form>
            )}
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

      {activeAlerts.length > 0 && (
        <div className="fixed top-4 right-4 z-[250] space-y-3 max-w-sm w-full px-4 sm:px-0">
          {activeAlerts.map((alertItem) => (
            <div
              key={alertItem.id}
              className="bg-[#0e0e18] border-2 border-amber-500 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 animate-pop-in"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {alertItem.title}
                </div>
                <button
                  onClick={() =>
                    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertItem.id))
                  }
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white font-bold text-sm mt-2">{alertItem.taskText}</p>
              <p className="text-xs text-gray-300 mt-1">
                Deadline: <span className="text-amber-300 font-semibold">{alertItem.deadlineText}</span>
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertItem.id))
                  }
                  className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold px-3.5 py-1.5 rounded-lg"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-400/40 flex items-center gap-2 text-sm font-semibold animate-pop-in">
          <Zap className="w-4 h-4 text-yellow-300" /> {toast}
        </div>
      )}

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
          <button onClick={() => handleNavigation('personalSnippets')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'personalSnippets' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><FolderLock className="w-5 h-5 text-amber-400" /> Personal Snippets</div>
            {userRole === 'guest' ? (
              <Lock className="w-4 h-4 text-gray-600" />
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {currentPersonalSnippets.length}
              </span>
            )}
          </button>
          <button onClick={() => handleNavigation('auraBot')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'auraBot' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> Aura AI Bot</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
          </button>
          <button onClick={() => handleNavigation('studyPlanner')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'studyPlanner' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><CheckSquare className="w-5 h-5" /> TaskFlow To-Do</div>
            {userRole === 'guest' ? (
              <Lock className="w-4 h-4 text-gray-600" />
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {currentStudyTasks.length}
              </span>
            )}
          </button>
          <button onClick={() => handleNavigation('bagPacker')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'bagPacker' ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> Routine & Packer</div>
            {userRole === 'guest' ? (
              <Lock className="w-4 h-4 text-gray-600" />
            ) : (
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                {currentBagItems.length}
              </span>
            )}
          </button>
          <button onClick={() => handleNavigation('feedback')} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${activeTab === 'feedback' ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5" /> Feedback</div>
            {userRole === 'guest' && <Lock className="w-4 h-4 text-gray-600" />}
            {userRole === 'admin' && feedbackList.length > 0 && (
              <span className="bg-cyan-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {feedbackList.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#050505]/50">
          <div className="hidden md:flex bg-[#12121a] rounded-lg p-3 items-center justify-between mb-4 border border-white/5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <div>
                <span className="text-xs font-bold text-gray-300 block">MuMu Vault</span>
                <span className="text-[10px] text-gray-500 block truncate max-w-[125px]">
                  {activeEmail || 'Guest (0 Pts)'}
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
                    {mumuPoints} MuMu Pts Synced
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

      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-y-auto overflow-x-hidden relative bg-[#050505]">
        {renderContent()}
      </div>

      {showSnippetModal && (snippetModalTarget === 'personal' ? Boolean(activeEmail) : userRole === 'admin') && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowSnippetModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {snippetModalTarget === 'personal' ? (
                <>
                  <FolderLock className="w-5 h-5 text-amber-400" />
                  {editingSnippet ? 'Edit My Personal Snippet' : 'Add Personal Snippet'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  {editingSnippet ? 'Edit Public Snippet' : 'Add Public Snippet'}
                </>
              )}
            </h2>
            <form onSubmit={handleSaveSnippet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                <select
                  value={snippetCategory}
                  onChange={(e) => setSnippetCategory(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="LINK">Link</option>
                  <option value="TEXT">Text</option>
                  <option value="JS">JavaScript (JS)</option>
                  <option value="REACT">React</option>
                  <option value="CSS">CSS</option>
                  <option value="HTML">HTML</option>
                  <option value="PYTHON">Python</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  {snippetCategory === 'LINK' ? 'Link / URL' : snippetCategory === 'TEXT' ? 'Text Content' : 'Content / Code'}
                </label>
                <textarea
                  rows={6}
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  placeholder={
                    snippetCategory === 'LINK'
                      ? 'Paste your link (e.g., https://...) here...'
                      : snippetCategory === 'TEXT'
                        ? 'Enter your text or notes here...'
                        : 'Paste your content or code here...'
                  }
                  className="w-full bg-[#12121a] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSnippetModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-sm font-bold ${
                    snippetModalTarget === 'personal'
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {editingSnippet ? 'Save Changes' : 'Create Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  ? 'Sign in to load your Personal Snippets, TaskFlow To-Do & MuMu Points'
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
