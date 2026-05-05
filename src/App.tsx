import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Keyboard as KeyboardIcon,
  BookOpen,
  Moon,
  Sun,
  Download,
  Heart,
  Youtube,
  BarChart3,
  Trophy,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import {
  INSCRIPT_MAP,
  REMADEL_MAP,
  LEARNING_LESSONS,
  PARAGRAPHS,
  ACHIEVEMENTS,
  Achievement,
  AchievementStats,
} from './constants';
import { LayoutType, ViewType, ThemeType, HeatMapData, SessionRecord } from './types';

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'achievement' | 'info';
  icon?: string;
}

let toastId = 0;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<ViewType>('home');
  const [layout, setLayout] = useState<LayoutType>('inscript');
  const [theme, setTheme] = useState<ThemeType>('dark');

  // Persistent data
  const [heatMap, setHeatMap] = useState<HeatMapData>(() => {
    try { return JSON.parse(localStorage.getItem('hindiHeatMap') || '{}'); } catch { return {}; }
  });
  const [records, setRecords] = useState<SessionRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('hindiRecords') || '[]'); } catch { return []; }
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hindiAchievements') || '[]'); } catch { return []; }
  });
  const [totalParagraphsDone, setTotalParagraphsDone] = useState<number>(() => {
    return Number(localStorage.getItem('hindiTotalParas') || '0');
  });
  const [totalLessonsDone, setTotalLessonsDone] = useState<number>(() => {
    return Number(localStorage.getItem('hindiTotalLessons') || '0');
  });

  // Session state
  const [lessonIndex, setLessonIndex] = useState(0);
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  // Free test timer
  const [freeTestTimer, setFreeTestTimer] = useState(60);
  const [freeTestRunning, setFreeTestRunning] = useState(false);
  const freeTestIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sidebar chart data (real WPM history)
  const recentWpms = records.slice(-7).map(r => r.wpm);
  const chartMax = Math.max(...recentWpms, 10);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Theme effect ──
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // ── Reset session state on view change ──
  useEffect(() => {
    setUserInput('');
    setIsError(false);
    setSessionStartTime(null);
    setTotalKeystrokes(0);
    setErrorCount(0);
    setSessionActive(false);
    if (view === 'learning') setLessonIndex(0);
    if (view === 'paragraph') setParagraphIndex(0);
    // Stop free test timer
    if (freeTestIntervalRef.current) clearInterval(freeTestIntervalRef.current);
    setFreeTestTimer(60);
    setFreeTestRunning(false);
  }, [view]);

  // ── Free test countdown ──
  useEffect(() => {
    if (freeTestRunning) {
      freeTestIntervalRef.current = setInterval(() => {
        setFreeTestTimer(t => {
          if (t <= 1) {
            clearInterval(freeTestIntervalRef.current!);
            setFreeTestRunning(false);
            // Save free test record
            const elapsed = 60;
            const words = userInput.trim().split(/\s+/).filter(Boolean).length;
            const wpm = Math.round(words / (elapsed / 60));
            const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100) : 100;
            addRecord({ wpm, accuracy, mode: 'Free Test' });
            showToast(`Session complete! ${wpm} WPM · ${accuracy}% accuracy`, 'success');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (freeTestIntervalRef.current) clearInterval(freeTestIntervalRef.current); };
  }, [freeTestRunning]);

  // ── Toast helpers ──
  const showToast = (message: string, type: Toast['type'] = 'info', icon?: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // ── Heatmap update ──
  const updateHeatMap = (char: string) => {
    setHeatMap(prev => {
      const next = { ...prev, [char]: (prev[char] || 0) + 1 };
      localStorage.setItem('hindiHeatMap', JSON.stringify(next));
      return next;
    });
  };

  // ── Compute most-errored key from heatmap of errors ──
  const [errorMap, setErrorMap] = useState<HeatMapData>(() => {
    try { return JSON.parse(localStorage.getItem('hindiErrorMap') || '{}'); } catch { return {}; }
  });

  const updateErrorMap = (char: string) => {
    setErrorMap(prev => {
      const next = { ...prev, [char]: (prev[char] || 0) + 1 };
      localStorage.setItem('hindiErrorMap', JSON.stringify(next));
      return next;
    });
  };

  const topErrorKey = Object.entries(errorMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // ── Achievement checker ──
  const checkAchievements = (newUnlocked: string[], stats: AchievementStats) => {
    const toCheck = ACHIEVEMENTS.filter(a => !newUnlocked.includes(a.id));
    const newlyUnlocked: Achievement[] = [];
    toCheck.forEach(a => {
      if (a.condition(stats)) newlyUnlocked.push(a);
    });
    if (newlyUnlocked.length > 0) {
      const updated = [...newUnlocked, ...newlyUnlocked.map(a => a.id)];
      setUnlockedAchievements(updated);
      localStorage.setItem('hindiAchievements', JSON.stringify(updated));
      newlyUnlocked.forEach(a => {
        setTimeout(() => showToast(`Achievement unlocked: ${a.title}`, 'achievement', a.icon), 400);
      });
      return updated;
    }
    return newUnlocked;
  };

  // ── Save record + check achievements ──
  const addRecord = ({ wpm, accuracy, mode }: { wpm: number; accuracy: number; mode: string }) => {
    const newRecord: SessionRecord = { date: new Date().toISOString(), wpm, accuracy, mode };
    setRecords(prev => {
      const next = [...prev, newRecord].slice(-20);
      localStorage.setItem('hindiRecords', JSON.stringify(next));

      const stats: AchievementStats = {
        totalSessions: next.length,
        bestWpm: Math.max(...next.map(r => r.wpm)),
        totalParagraphs: totalParagraphsDone,
        totalLessons: totalLessonsDone,
        bestAccuracy: Math.max(...next.map(r => r.accuracy)),
      };
      checkAchievements(unlockedAchievements, stats);
      return next;
    });
  };

  // ── Input handler ──
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Start timer on first keystroke
    if (!sessionActive && value.length > 0) {
      setSessionStartTime(Date.now());
      setSessionActive(true);
      if (view === 'practice') {
        setFreeTestRunning(true);
      }
    }

    setTotalKeystrokes(prev => prev + 1);

    let target = '';
    if (view === 'learning') target = LEARNING_LESSONS[lessonIndex].target;
    else if (view === 'paragraph') target = PARAGRAPHS[paragraphIndex];
    else {
      // Free test: just accept input, track chars typed
      setUserInput(value);
      return;
    }

    if (target.startsWith(value)) {
      setUserInput(value);
      setIsError(false);

      if (value === target) {
        const elapsed = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 / 60 : 1;
        const wordCount = target.replace(/[^\u0900-\u097F\s]/g, '').split(/\s+/).filter(Boolean).length || Math.ceil(target.length / 5);
        const wpm = Math.max(1, Math.round(wordCount / elapsed));
        const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorCount) / (totalKeystrokes + 1)) * 100) : 100;

        if (view === 'learning') {
          const newTotal = totalLessonsDone + 1;
          setTotalLessonsDone(newTotal);
          localStorage.setItem('hindiTotalLessons', String(newTotal));
          addRecord({ wpm, accuracy, mode: 'Learning' });
          showToast(`Lesson complete! ${wpm} WPM · ${accuracy}% accuracy`, 'success');
          if (lessonIndex < LEARNING_LESSONS.length - 1) {
            setLessonIndex(prev => prev + 1);
            setUserInput('');
            setSessionStartTime(null);
            setSessionActive(false);
            setTotalKeystrokes(0);
            setErrorCount(0);
          } else {
            showToast('🎓 You completed all lessons!', 'achievement', '🎓');
            setView('home');
          }
        } else if (view === 'paragraph') {
          const newTotal = totalParagraphsDone + 1;
          setTotalParagraphsDone(newTotal);
          localStorage.setItem('hindiTotalParas', String(newTotal));
          addRecord({ wpm, accuracy, mode: 'Paragraph' });
          showToast(`Paragraph done! ${wpm} WPM · ${accuracy}% accuracy`, 'success');
          if (paragraphIndex < PARAGRAPHS.length - 1) {
            setParagraphIndex(prev => prev + 1);
            setUserInput('');
            setSessionStartTime(null);
            setSessionActive(false);
            setTotalKeystrokes(0);
            setErrorCount(0);
          } else {
            showToast('🏆 All paragraphs complete!', 'achievement', '🏆');
            setView('home');
          }
        }
      }
    } else {
      setIsError(true);
      setErrorCount(prev => prev + 1);
      // Track which target char was missed
      const expectedChar = target[value.length - 1] || target[value.length];
      if (expectedChar) updateErrorMap(expectedChar);
      setTimeout(() => setIsError(false), 200);
    }
  };

  // ── Keyboard handler for heatmap ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (view === 'home') return;
    if (inputRef.current) inputRef.current.focus();
    const currentMap = layout === 'inscript' ? INSCRIPT_MAP : REMADEL_MAP;
    const keyMatch = currentMap.find(k => k.code === e.code);
    if (keyMatch) {
      const char = e.shiftKey ? keyMatch.shift : keyMatch.char;
      updateHeatMap(char);
    }
  }, [view, layout]);

  // ── Restart session ──
  const restartSession = () => {
    setUserInput('');
    setIsError(false);
    setSessionStartTime(null);
    setSessionActive(false);
    setTotalKeystrokes(0);
    setErrorCount(0);
    if (view === 'practice') {
      if (freeTestIntervalRef.current) clearInterval(freeTestIntervalRef.current);
      setFreeTestTimer(60);
      setFreeTestRunning(false);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLayout = () => setLayout(prev => prev === 'inscript' ? 'remadel' : 'inscript');

  // ── Live stats ──
  const liveAccuracy = totalKeystrokes > 0
    ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)
    : 100;
  const liveWpm = sessionStartTime && sessionActive
    ? Math.max(0, Math.round(
        (userInput.length / 5) / ((Date.now() - sessionStartTime) / 1000 / 60)
      ))
    : 0;
  const lastRecord = records[records.length - 1];

  // ── Colors ──
  const colors = {
    bg: theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-[#f3f0ff]',
    surface: theme === 'dark' ? 'bg-[#252545]' : 'bg-white',
    surfaceSubtle: theme === 'dark' ? 'bg-[#252545]/50' : 'bg-white/50',
    text: theme === 'dark' ? 'text-[#E6E6FA]' : 'text-[#2d2d50]',
    primary: theme === 'dark' ? 'text-[#E6E6FA]' : 'text-[#9370DB]',
    accent: theme === 'dark' ? 'text-[#9370DB]' : 'text-[#7b68ee]',
    accentBg: theme === 'dark' ? 'bg-[#9370DB]' : 'bg-[#9370DB]',
    border: theme === 'dark' ? 'border-[#E6E6FA]/20' : 'border-[#9370DB]/20',
    key: theme === 'dark' ? 'bg-white/5' : 'bg-[#e0d7ff]',
    btnActive: theme === 'dark' ? 'bg-[#E6E6FA] text-[#1A1A2E]' : 'bg-[#9370DB] text-white',
  };

  return (
    <div
      className={`min-h-screen ${colors.bg} ${colors.text} transition-colors duration-300 flex flex-col font-sans select-none`}
      onKeyDown={handleKeyDown}
    >
      {/* ── Toast Notifications ── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold max-w-xs
                ${t.type === 'achievement'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black'
                  : t.type === 'success'
                  ? (theme === 'dark' ? 'bg-[#252545] text-[#E6E6FA] border border-[#9370DB]/40' : 'bg-white text-[#2d2d50] border border-[#9370DB]/30')
                  : (theme === 'dark' ? 'bg-[#252545] text-[#E6E6FA]' : 'bg-white text-[#2d2d50]')}
              `}
            >
              {t.icon && <span className="text-lg">{t.icon}</span>}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Donation hover button ── */}
      <div className="fixed bottom-28 right-4 z-50 group">
        <a
          href="https://commercesehoga.github.io/help"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-2 shadow-lg transition-all duration-300 overflow-hidden"
        >
          <Heart size={16} className="shrink-0" />
          <span className="text-xs font-bold whitespace-nowrap max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
            Support Us ♥
          </span>
        </a>
      </div>

      {/* ── Header ── */}
      <header className={`h-12 ${colors.surface} border-b ${colors.border} flex items-center justify-between px-6 shrink-0 z-50`}>
        <div className="flex gap-6 text-[10px] sm:text-xs font-semibold tracking-widest uppercase opacity-70">
          <a href="https://youtube.com/@wondermayank" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100">
            <Youtube size={14} className={colors.primary} /> YouTube
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 hover:opacity-100">
            Instagram
          </a>
        </div>
        <div className={`text-sm font-bold flex items-center ${theme === 'dark' ? 'text-white' : colors.text}`}>
          Hindi Practice
          <span className="text-[10px] font-normal opacity-50 ml-2 hidden xs:inline">by Wondermayank</span>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className={`flex-1 overflow-y-auto px-4 sm:px-8 py-8 ${view !== 'home' ? 'md:w-2/3' : 'w-full'}`}>
          <AnimatePresence mode="wait">

            {/* ══ HOME ══ */}
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                {/* Hero */}
                <div className="text-center space-y-4 py-8">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mx-auto flex justify-center">
                    <svg width="80" height="80" viewBox="0 0 24 24" className={`fill-current ${colors.primary}`}>
                      <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
                    </svg>
                  </motion.div>
                  <h1 className={`text-3xl sm:text-4xl font-bold ${theme === 'dark' ? 'text-white' : colors.text}`}>Master Hindi Typing</h1>
                  <p className="opacity-60 max-w-sm mx-auto text-sm leading-relaxed">Master Inscript and Remington layouts with real WPM tracking, accuracy analysis, and achievements.</p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Key Heatmap */}
                  <div className={`${colors.surfaceSubtle} p-6 rounded-xl border ${colors.border} shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 size={18} className={colors.accent} />
                      <h3 className="text-xs uppercase tracking-widest font-bold opacity-70">Key Heatmap</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(heatMap) as [string, number][])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([key, val]) => (
                          <div key={key} className={`${theme === 'dark' ? 'bg-black/20' : 'bg-white/20'} px-3 py-1 rounded-lg text-xs flex items-center gap-2 border border-white/5`}>
                            <span className="font-bold text-base">{key}</span>
                            <span className="opacity-40">{val}</span>
                          </div>
                        ))}
                      {Object.keys(heatMap).length === 0 && <p className="text-[10px] opacity-40">Records appear as you type...</p>}
                    </div>
                  </div>

                  {/* Past Records */}
                  <div className={`${colors.surfaceSubtle} p-6 rounded-xl border ${colors.border} shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-center gap-3 mb-4">
                      <KeyboardIcon size={18} className={colors.accent} />
                      <h3 className="text-xs uppercase tracking-widest font-bold opacity-70">Past Records</h3>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {records.length > 0 ? records.slice().reverse().map((rec, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] sm:text-xs opacity-70 border-b border-white/5 pb-1">
                          <span>{new Date(rec.date).toLocaleDateString()}</span>
                          <span className="opacity-50 text-[9px]">{rec.mode}</span>
                          <span className="font-bold">{rec.wpm} WPM · {rec.accuracy}%</span>
                        </div>
                      )) : (
                        <p className="text-[10px] opacity-40">Complete a session to log performance.</p>
                      )}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className={`${colors.surfaceSubtle} p-6 rounded-xl border ${colors.border} shadow-lg`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy size={18} className={colors.accent} />
                      <h3 className="text-xs uppercase tracking-widest font-bold opacity-70">Achievements</h3>
                      <span className="ml-auto text-[10px] opacity-50">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {ACHIEVEMENTS.map(a => {
                        const unlocked = unlockedAchievements.includes(a.id);
                        return (
                          <div
                            key={a.id}
                            title={a.description}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] border transition-all
                              ${unlocked
                                ? 'border-yellow-400/40 bg-yellow-400/10'
                                : `border-white/5 ${theme === 'dark' ? 'bg-black/10' : 'bg-gray-100/50'} opacity-40`}`}
                          >
                            <span className="text-base">{a.icon}</span>
                            <span className="font-semibold leading-tight">{a.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ PRACTICE VIEWS ══ */}
            {view !== 'home' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Mode selector + layout toggle */}
                <div className={`${colors.surfaceSubtle} rounded-xl border ${colors.border} p-6`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Mode tabs */}
                    <div className="flex gap-2 flex-wrap">
                      {(['learning', 'paragraph', 'practice'] as ViewType[]).map(v => (
                        <button
                          key={v}
                          onClick={() => setView(v)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all capitalize
                            ${view === v ? colors.btnActive : 'border border-white/20 opacity-60 hover:opacity-100'}`}
                        >
                          {v === 'learning' ? 'Learn Basic' : v === 'paragraph' ? 'Paragraph' : 'Free Test'}
                        </button>
                      ))}
                    </div>

                    {/* Layout toggle — moved from dock into practice section */}
                    <button
                      onClick={toggleLayout}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${colors.border} hover:opacity-100 opacity-70 transition-all`}
                    >
                      <BookOpen size={13} />
                      <span className="uppercase tracking-wider">{layout === 'inscript' ? 'Inscript' : 'Remington'}</span>
                      <ChevronRight size={12} className="rotate-90" />
                    </button>
                  </div>

                  {/* Instruction / progress */}
                  {view === 'learning' && (
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm italic opacity-80 border-l-2 border-[#9370DB]/50 pl-3`}>
                          {LEARNING_LESSONS[lessonIndex].instruction}
                        </p>
                        <span className="text-[10px] opacity-50 ml-4 shrink-0">
                          {lessonIndex + 1}/{LEARNING_LESSONS.length}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#9370DB] transition-all duration-500"
                          style={{ width: `${((lessonIndex + 1) / LEARNING_LESSONS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {view === 'paragraph' && (
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm italic opacity-80 border-l-2 border-[#9370DB]/50 pl-3`}>
                          Exercise {paragraphIndex + 1}/{PARAGRAPHS.length}: Type the following text accurately.
                        </p>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#9370DB] transition-all duration-500"
                          style={{ width: `${((paragraphIndex) / PARAGRAPHS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {view === 'practice' && (
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm italic opacity-60 pl-3 border-l-2 border-[#9370DB]/50">
                        Free typing — 60 second timer. Type anything in Hindi.
                      </p>
                      <span className={`text-2xl font-bold tabular-nums ${freeTestTimer <= 10 ? 'text-red-400' : colors.accent}`}>
                        {freeTestTimer}s
                      </span>
                    </div>
                  )}

                  {/* Text display area */}
                  <div className={`h-32 sm:h-40 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-100/50'} rounded-lg relative overflow-hidden`}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={onInputChange}
                      onKeyDown={handleKeyDown}
                      className="absolute inset-0 opacity-0 cursor-default"
                      autoFocus
                      disabled={view === 'practice' && freeTestTimer === 0}
                    />
                    <motion.div
                      animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.2 }}
                      className={`font-bold transition-colors px-6 w-full
                        ${isError ? 'text-red-500' : (theme === 'dark' ? 'text-white' : colors.text)}
                        ${view === 'paragraph' ? 'text-xl sm:text-2xl leading-relaxed text-left max-w-2xl tracking-normal' : 'text-4xl sm:text-6xl tracking-[0.5rem] sm:tracking-[1rem] text-center'}`}
                    >
                      {view === 'practice' ? (
                        userInput.length > 0
                          ? <span className="text-[#9370DB]">{userInput}</span>
                          : <span className="opacity-20">टाइप शुरू करें...</span>
                      ) : (
                        <>
                          <span className="text-[#9370DB]">{userInput}</span>
                          <span className="opacity-25">
                            {(view === 'learning'
                              ? LEARNING_LESSONS[lessonIndex].target
                              : PARAGRAPHS[paragraphIndex]
                            ).slice(userInput.length)}
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Restart / skip buttons */}
                  <div className="flex gap-2 mt-4 justify-end">
                    <button
                      onClick={restartSession}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-white/15 opacity-60 hover:opacity-100 transition-all"
                    >
                      <RotateCcw size={12} /> Restart
                    </button>
                    {view === 'learning' && lessonIndex < LEARNING_LESSONS.length - 1 && (
                      <button
                        onClick={() => { setLessonIndex(p => p + 1); restartSession(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-white/15 opacity-60 hover:opacity-100 transition-all"
                      >
                        Skip <ChevronRight size={12} />
                      </button>
                    )}
                    {view === 'paragraph' && paragraphIndex < PARAGRAPHS.length - 1 && (
                      <button
                        onClick={() => { setParagraphIndex(p => p + 1); restartSession(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-white/15 opacity-60 hover:opacity-100 transition-all"
                      >
                        Skip <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Keyboard */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                      Layout: {layout === 'inscript' ? 'Inscript' : 'Remington (Mangal)'}
                    </span>
                    <div className="flex gap-1 items-center text-[9px] opacity-40">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div><span className="mr-2">&gt;20</span>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div><span className="mr-2">&gt;50</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div><span>&gt;100</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {[0, 1, 2, 3].map(row => (
                      <div key={row} className="flex justify-center gap-1 sm:gap-1.5">
                        {(layout === 'inscript' ? INSCRIPT_MAP : REMADEL_MAP)
                          .filter(k => k.row === row)
                          .map(k => {
                            const count = heatMap[k.char] || 0;
                            // FIX: use else-if to avoid cascading border classes
                            const heatBorder =
                              count > 100 ? 'border-b-2 border-red-400' :
                              count > 50  ? 'border-b-2 border-yellow-400' :
                              count > 20  ? 'border-b-2 border-green-400' :
                              'border-b border-transparent';
                            return (
                              <div
                                key={k.code}
                                className={`
                                  ${layout === 'remadel' ? 'bg-white text-black border-gray-200' : `${colors.key} ${colors.text} border-white/10`}
                                  flex flex-col items-center justify-center h-10 w-9 sm:h-14 sm:w-14 rounded sm:rounded-lg border shadow-sm transition-all text-[10px] sm:text-xs
                                  ${heatBorder}
                                `}
                              >
                                <span className="text-sm sm:text-lg font-bold leading-none">{k.char}</span>
                                <span className="text-[8px] sm:text-[9px] opacity-30 font-mono mt-1">{k.shift || k.code.replace('Key', '')}</span>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── Sidebar ── */}
        {view !== 'home' && (
          <aside className={`hidden md:flex w-1/3 ${theme === 'dark' ? 'bg-[#252545]/30' : 'bg-gray-100/50'} border-l ${colors.border} p-6 flex-col gap-8`}>

            {/* Live Performance */}
            <section>
              <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-4">Live Performance</h3>

              {/* Real WPM chart from last 7 sessions */}
              <div className={`${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'} rounded-lg p-4 h-32 flex items-end justify-between gap-1`}>
                {recentWpms.length > 0 ? recentWpms.map((w, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.max(4, (w / chartMax) * 100)}%` }}
                    className={`w-full ${i === recentWpms.length - 1 ? 'bg-[#9370DB]' : 'bg-[#9370DB]/30'} rounded-t-sm transition-all duration-700`}
                    title={`${w} WPM`}
                  />
                )) : (
                  <p className="text-[10px] opacity-30 m-auto">Complete sessions to see chart</p>
                )}
              </div>

              {/* Live stats */}
              <div className="flex justify-between mt-4 px-1">
                <div className="text-center">
                  <div className="text-xl font-bold leading-none tabular-nums">{sessionActive ? liveWpm : (lastRecord?.wpm || 0)}</div>
                  <div className="text-[8px] opacity-40 mt-1 uppercase font-bold tracking-tighter">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold leading-none tabular-nums">{liveAccuracy}%</div>
                  <div className="text-[8px] opacity-40 mt-1 uppercase font-bold tracking-tighter">ACC</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold leading-none">{topErrorKey}</div>
                  <div className="text-[8px] opacity-40 mt-1 uppercase font-bold tracking-tighter">ERR KEY</div>
                </div>
              </div>
            </section>

            {/* Weekly Challenge — driven by real paragraph count */}
            <section className="space-y-4">
              <div className={`${theme === 'dark' ? 'bg-[#E6E6FA]/5' : 'bg-white'} border ${colors.border} rounded-lg p-4 shadow-sm`}>
                <h4 className="text-xs font-bold mb-1">Weekly Challenge</h4>
                <p className="text-[10px] opacity-60 mb-3 italic">
                  Complete 5 paragraphs to earn the "Linguist" badge.
                  ({Math.min(totalParagraphsDone, 5)}/5 done)
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9370DB] transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalParagraphsDone / 5) * 100)}%` }}
                  />
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-black/10' : 'bg-white/60'} rounded-lg p-4 border border-dashed ${colors.border}`}>
                <h4 className="text-xs font-bold mb-1 opacity-50">Pro Tip</h4>
                <p className="text-[10px] opacity-40 leading-relaxed">
                  Keep your wrists slightly elevated to avoid fatigue during long paragraphs.
                </p>
              </div>

              {/* Achievements mini list */}
              <div className={`${theme === 'dark' ? 'bg-[#E6E6FA]/5' : 'bg-white'} border ${colors.border} rounded-lg p-4`}>
                <h4 className="text-xs font-bold mb-3 flex items-center gap-2">
                  <Trophy size={12} /> Achievements
                  <span className="opacity-40 ml-auto">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                </h4>
                <div className="space-y-1.5">
                  {ACHIEVEMENTS.slice(0, 5).map(a => {
                    const unlocked = unlockedAchievements.includes(a.id);
                    return (
                      <div key={a.id} className={`flex items-center gap-2 text-[10px] ${unlocked ? 'opacity-100' : 'opacity-30'}`}>
                        <span>{a.icon}</span>
                        <span>{a.title}</span>
                        {unlocked && <span className="ml-auto text-green-400">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </aside>
        )}
      </div>

      {/* ── Bottom Dock ── */}
      <div className="h-24 flex items-center justify-center shrink-0">
        <nav className={`${colors.surface} border ${colors.border} rounded-full px-6 py-2 flex items-center gap-8 shadow-2xl backdrop-blur-md`}>
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? colors.primary : 'opacity-40 hover:opacity-100'}`}
          >
            <Home size={20} />
            <span className="text-[9px] uppercase font-bold">Home</span>
          </button>

          <button
            onClick={() => setView(view === 'home' ? 'learning' : view)}
            className={`flex flex-col items-center gap-1 transition-all ${view !== 'home' ? colors.primary : 'opacity-40 hover:opacity-100'}`}
          >
            <KeyboardIcon size={20} />
            <span className="text-[9px] uppercase font-bold">Practice</span>
          </button>

          <div className="h-8 w-px bg-white/10 mx-1" />

          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-[9px] uppercase font-bold">Theme</span>
          </button>

          <button
            onClick={() => {
              const stats: AchievementStats = {
                totalSessions: records.length,
                bestWpm: records.length > 0 ? Math.max(...records.map(r => r.wpm)) : 0,
                totalParagraphs: totalParagraphsDone,
                totalLessons: totalLessonsDone,
                bestAccuracy: records.length > 0 ? Math.max(...records.map(r => r.accuracy)) : 0,
              };
              const lines = [
                'Hindi Typing Console — Achievement Summary',
                `Best WPM: ${stats.bestWpm}`,
                `Total Sessions: ${stats.totalSessions}`,
                `Paragraphs Done: ${stats.totalParagraphs}`,
                `Lessons Done: ${stats.totalLessons}`,
                '',
                'Unlocked:',
                ...ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).map(a => `${a.icon} ${a.title}`),
              ];
              const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'hindi-achievements.txt'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all"
          >
            <Download size={20} />
            <span className="text-[9px] uppercase font-bold">Export</span>
          </button>
        </nav>
      </div>

      {/* Attribution */}
      <div className="fixed bottom-4 right-4 text-[10px] opacity-20 pointer-events-none text-right">
        commercesehoga.github.io • wondermayank<br />
        Hindi Typing Console v2.0
      </div>
    </div>
  );
}
