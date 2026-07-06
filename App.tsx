
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, RotateCcw, ChevronRight, ChevronLeft, Cpu, MessageSquare, Trophy, Zap, 
  Lightbulb, MousePointer2, Code2, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  XCircle, CheckCircle2, Sparkles, Loader2, Layers, Terminal, Activity, ShieldCheck, 
  BookOpen, Target, Search, Settings, HelpCircle, Bell, History, Database, Cpu as CpuIcon,
  LogOut, User, Lock, Mail, HardDrive, BarChart3, Wifi, Terminal as TerminalIcon, 
  ChevronDown, FileCode, Minus, Square
} from 'lucide-react';
import { LEVELS, COMMAND_LIST } from './constants';
import { GameState, Command } from './types';
import { getCodeFeedback } from './services/geminiService';
import GameCanvas from './components/GameCanvas';

type EditorMode = 'Logic Blocks' | 'Python IDE';
type MissionTab = 'mission' | 'education' | 'telemetry';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSystemOverlay, setShowSystemOverlay] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('Logic Blocks');
  const [activeTab, setActiveTab] = useState<MissionTab>('mission');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isLevelMinimized, setIsLevelMinimized] = useState(false);
  const [code, setCode] = useState(LEVELS[0].initialCode);
  const [blockSequence, setBlockSequence] = useState<string[]>([]);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'warn' | 'success'}[]>([]);
  const [email, setEmail] = useState('');
  
  // Suggestion Engine
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSugIdx, setSelectedSugIdx] = useState(0);
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 });
  const [isSugVisible, setIsSugVisible] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    playerPos: LEVELS[0].startPos,
    isSuccess: false,
    isError: false,
    isJumping: false,
    message: "System initialized. Nexus-1 online.",
    executionHistory: []
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[currentLevelIdx];

  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [...prev.slice(-15), { msg, type }]);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (editorMode === 'Logic Blocks') {
      const pythonCode = blockSequence.length > 0 
        ? blockSequence.map(b => `${b}()`).join('\n')
        : "# Program sequence empty.";
      setCode(pythonCode);
    }
  }, [blockSequence, editorMode]);

  const resetGame = useCallback(() => {
    setGameState({
      playerPos: level.startPos,
      isSuccess: false,
      isError: false,
      isJumping: false,
      message: "Unit repositioned.",
      executionHistory: []
    });
    setAiFeedback(null);
    addLog(`Reset: Nexus-1 at ${level.startPos.join(',')}`, 'warn');
  }, [level, addLog]);

  useEffect(() => {
    setBlockSequence([]);
    setCode(level.initialCode);
    resetGame();
    addLog(`Mission: ${level.title}`, 'success');
  }, [level, resetGame, addLog]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    addLog(`Auth success: ${email || 'Admin'}`, 'success');
  };

  const handleGuestLogin = () => {
    setEmail('guest@nexus.io');
    setIsAuthenticated(true);
    addLog(`Guest access enabled`, 'success');
  };

  const addBlock = (blockName: string) => {
    if (isExecuting) return;
    setBlockSequence(prev => [...prev, blockName]);
  };

  const removeBlock = (index: number) => {
    if (isExecuting) return;
    setBlockSequence(prev => prev.filter((_, i) => i !== index));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setCode(newVal);

    if (editorMode !== 'Python IDE') return;

    const cursor = e.target.selectionStart;
    const beforeCursor = newVal.substring(0, cursor);
    const lastLine = beforeCursor.split('\n').pop() || '';
    const wordMatch = lastLine.match(/[a-z_]+$/i);
    const word = wordMatch ? wordMatch[0] : '';

    if (word.length >= 2) {
      const filtered = COMMAND_LIST.filter(cmd => cmd.startsWith(word.toLowerCase()));
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSelectedSugIdx(0);
        setIsSugVisible(true);
        const lines = beforeCursor.split('\n');
        setSuggestionPos({
          top: lines.length * 24 + 40,
          left: lines[lines.length - 1].length * 8 + 40
        });
      } else {
        setIsSugVisible(false);
      }
    } else {
      setIsSugVisible(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const beforeCursor = code.substring(0, cursor);
    const afterCursor = code.substring(cursor);
    const wordMatch = beforeCursor.match(/[a-z_]+$/i);
    const wordLength = wordMatch ? wordMatch[0].length : 0;
    const newCode = beforeCursor.substring(0, cursor - wordLength) + suggestion + afterCursor;
    setCode(newCode);
    setIsSugVisible(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = cursor - wordLength + suggestion.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const executeCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    resetGame();
    addLog("Executing sequence...", "info");

    const lines = code.split('\n');
    const commands: Command[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const funcMatch = trimmed.match(/^([a-z_]+)\((.*)\)$/);
      if (funcMatch) {
        commands.push(funcMatch[1].toUpperCase() as Command);
      }
    });

    if (commands.length === 0) {
      setGameState(prev => ({ ...prev, isError: true, message: "No commands found." }));
      setIsExecuting(false);
      return;
    }

    let currentPos: [number, number] = [...level.startPos];
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      await new Promise(r => setTimeout(r, 400));
      let nextPos: [number, number] = [...currentPos];
      const isJump = cmd.startsWith('JUMP');
      if (isJump) setGameState(prev => ({ ...prev, isJumping: true }));
      const dist = isJump ? 2 : 1;
      if (cmd.endsWith('UP')) nextPos[0] -= dist;
      else if (cmd.endsWith('DOWN')) nextPos[0] += dist;
      else if (cmd.endsWith('LEFT')) nextPos[1] -= dist;
      else if (cmd.endsWith('RIGHT')) nextPos[1] += dist;

      if (nextPos[0] < 0 || nextPos[0] >= level.gridSize[0] || nextPos[1] < 0 || nextPos[1] >= level.gridSize[1]) {
        setGameState(prev => ({ ...prev, isError: true, message: "Out of bounds." }));
        break;
      }
      if (level.obstacles.some(o => o[0] === nextPos[0] && o[1] === nextPos[1])) {
        setGameState(prev => ({ ...prev, playerPos: nextPos, isError: true, message: "Collision." }));
        break;
      }
      if (level.enemies.some(e => e[0] === nextPos[0] && e[1] === nextPos[1])) {
        setGameState(prev => ({ ...prev, playerPos: nextPos, isError: true, message: "Intercepted." }));
        break;
      }
      currentPos = nextPos;
      setGameState(prev => ({ ...prev, playerPos: currentPos, isJumping: false }));
      if (currentPos[0] === level.goalPos[0] && currentPos[1] === level.goalPos[1]) {
        setGameState(prev => ({ ...prev, isSuccess: true, message: "Success." }));
        break;
      }
    }
    setIsExecuting(false);
    setIsAiLoading(true);
    const feedback = await getCodeFeedback(code, level.title, level.objective, currentPos[0] === level.goalPos[0] && currentPos[1] === level.goalPos[1]);
    setAiFeedback(feedback);
    setIsAiLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10"></div>
        <div className="glass-panel w-full max-w-sm p-8 rounded-3xl border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl">
              <CpuIcon size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white text-center mb-1 text-shimmer">Nexus Auth</h1>
          <p className="text-slate-500 text-center text-xs mb-8">Enter credentials or use guest access.</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" required placeholder="operator@nexus.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-indigo-500 text-white" />
            <input type="password" required placeholder="PIN"
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-indigo-500 text-white" />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all uppercase tracking-widest text-[10px]">Verify</button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[8px] uppercase font-bold"><span className="bg-[#0f172a] px-2 text-slate-600">or</span></div>
            </div>
            <button type="button" onClick={handleGuestLogin} className="w-full bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-[10px] border border-white/5">Continue as Guest</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-200 overflow-hidden">
      {/* Compact Header */}
      <header className="glass-panel border-b border-white/5 px-6 py-3 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSystemOverlay(true)} className="p-2 bg-indigo-600 rounded-lg hover:scale-105 transition-all">
              <CpuIcon size={18} className="text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tighter nexus-gradient-text leading-none">NEXUS CODE</h1>
                <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">PRO</span>
              </div>
            </div>
          </div>
          <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-white/5">
            {(['Logic Blocks', 'Python IDE'] as EditorMode[]).map((mode) => (
              <button key={mode} onClick={() => setEditorMode(mode)}
                className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${editorMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{mode}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Settings size={16} className="text-slate-500 cursor-pointer" />
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/40 rounded-xl border border-white/5">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><User size={12} className="text-indigo-400" /></div>
              <span className="text-[9px] font-black uppercase text-white truncate max-w-[80px]">{email.split('@')[0] || 'User'}</span>
              <LogOut size={12} onClick={() => setIsAuthenticated(false)} className="text-slate-600 hover:text-red-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Diagnostics Overlay */}
      {showSystemOverlay && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl p-8 flex items-center justify-center animate-in fade-in duration-300">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">System Diagnostics</h2>
              <XCircle size={32} className="text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowSystemOverlay(false)} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[ {icon: HardDrive, label: 'Memory', val: '12.4GB', color: 'indigo'}, {icon: BarChart3, label: 'Logic', val: '42%', color: 'emerald'}, {icon: Wifi, label: 'Link', val: '94ms', color: 'amber'} ].map((s,i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10">
                  <s.icon className={`text-${s.color}-400 mb-4`} size={24} />
                  <div className="text-xl font-black text-white">{s.val}</div>
                  <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSystemOverlay(false)} className="mt-10 px-8 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white mx-auto block">Close</button>
          </div>
        </div>
      )}

      {showIntro ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">Code <span className="text-shimmer italic">Evolved.</span></h1>
            <p className="text-lg text-slate-500 font-medium">Professional Python logic environment for the Martian Frontier.</p>
            <button onClick={() => setShowIntro(false)} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all">Initialize Core</button>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-row p-4 gap-4 max-w-[2000px] mx-auto w-full min-h-0">
          {/* Workspace */}
          <div className="flex-[1.2] flex flex-col gap-4 min-w-0 min-h-0">
            <div className={`glass-panel rounded-3xl overflow-hidden flex flex-col shrink-0 ${isLevelMinimized ? 'h-11' : ''}`}>
              <div className="px-5 py-3 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 mr-2">
                    <div className="window-control ctrl-close" />
                    <button onClick={() => setIsLevelMinimized(!isLevelMinimized)} className="window-control ctrl-min hover:scale-125 transition-all" />
                    <div className="window-control ctrl-max" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Level 0{level.id}: {isLevelMinimized ? level.title : ''}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentLevelIdx(Math.max(0, currentLevelIdx-1))} className="p-1.5 hover:bg-slate-800 rounded-md transition-all"><ChevronLeft size={14}/></button>
                  <button onClick={() => setCurrentLevelIdx(Math.min(LEVELS.length-1, currentLevelIdx+1))} className="p-1.5 hover:bg-slate-800 rounded-md transition-all"><ChevronRight size={14}/></button>
                </div>
              </div>
              {!isLevelMinimized && (
                <div className="p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h2 className="text-xl font-black text-white mb-2">{level.title}</h2>
                  <div className="flex gap-2 mb-4">
                    {(['mission', 'education', 'telemetry'] as MissionTab[]).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${activeTab === tab ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-900/30 border-white/5 text-slate-500'}`}>{tab}</button>
                    ))}
                  </div>
                  <div className="bg-slate-900/20 p-4 rounded-xl border border-white/5 min-h-[80px]">
                    {activeTab === 'mission' && <p className="text-slate-400 text-xs leading-relaxed">{level.description}</p>}
                    {activeTab === 'education' && (
                      <div className="space-y-2">
                        <p className="text-slate-400 text-[10px] leading-relaxed">{level.lesson.explanation}</p>
                        <div className="p-2 bg-slate-950 rounded-lg text-emerald-400 text-[9px] jetbrains-mono">{level.lesson.pythonSnippet}</div>
                      </div>
                    )}
                    {activeTab === 'telemetry' && <div className="text-[10px] text-slate-500 uppercase">Logic precision: 99.9% // Overhead: 12ms</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-0 relative">
              <div className="px-5 py-2.5 bg-slate-900/40 border-b border-white/5 flex justify-between items-center shrink-0">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{editorMode}</span>
              </div>
              <div className="flex-1 flex min-h-0 relative">
                {editorMode === 'Logic Blocks' ? (
                  <>
                    <div className="w-48 bg-slate-950/40 border-r border-white/5 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                      {COMMAND_LIST.map(cmd => (
                        <button key={cmd} onClick={() => addBlock(cmd.replace('()',''))}
                          className="w-full text-left p-2.5 rounded-xl font-black text-[9px] uppercase border border-white/5 bg-slate-900/20 text-slate-500 hover:text-white hover:bg-slate-900 transition-all">{cmd.replace('()','').replace('_',' ')}</button>
                      ))}
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                      <div className="flex flex-col gap-2 max-w-xs mx-auto">
                        {blockSequence.length === 0 ? <p className="text-[10px] text-center opacity-20 py-12 uppercase tracking-widest">Empty stack</p> :
                          blockSequence.map((block, i) => (
                            <div key={i} className="flex-1 p-3 bg-indigo-600 rounded-xl text-white font-black text-[9px] flex justify-between items-center uppercase tracking-wider">
                              <span>{block.replace('_',' ')}</span>
                              <button onClick={() => removeBlock(i)}><XCircle size={14}/></button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 relative">
                    <textarea ref={textareaRef} value={code} onChange={handleCodeChange}
                      className="flex-1 bg-transparent p-6 jetbrains-mono text-sm text-indigo-50 focus:outline-none resize-none leading-relaxed" spellCheck={false} />
                    {isSugVisible && (
                      <div className="absolute z-[200] glass-panel rounded-lg border border-white/10 overflow-hidden shadow-2xl min-w-[150px]" style={{ top: suggestionPos.top, left: suggestionPos.left }}>
                        {suggestions.map((s, idx) => (
                          <button key={idx} onClick={() => applySuggestion(s)} className={`w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-widest ${idx === selectedSugIdx ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between shrink-0">
                <button onClick={resetGame} className="px-4 py-2 bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest">Reset</button>
                <button onClick={executeCode} disabled={isExecuting}
                  className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {isExecuting ? <Loader2 size={14} className="animate-spin" /> : 'Run sequence'}
                </button>
              </div>
            </div>
          </div>

          {/* Visualization & Feedback */}
          <div className="flex-1 flex flex-col gap-4 min-w-[400px] min-h-0">
            <div className="glass-panel rounded-3xl overflow-hidden flex flex-col shrink-0 aspect-square border border-white/5">
              <div className="px-5 py-2.5 bg-slate-900/40 border-b border-white/5 shrink-0 flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Link Feed</span>
              </div>
              <div className="flex-1 flex items-center justify-center bg-slate-950/40 relative min-h-0 overflow-hidden p-4">
                <GameCanvas level={level} playerPos={gameState.playerPos} isJumping={gameState.isJumping} isError={gameState.isError} isSuccess={gameState.isSuccess} />
              </div>
              <div className={`p-4 flex items-center gap-3 shrink-0 ${gameState.isError ? 'bg-red-500/10' : gameState.isSuccess ? 'bg-emerald-500/10' : 'bg-slate-900/60'}`}>
                <div className={`p-2 rounded-lg ${gameState.isError ? 'bg-red-500/20 text-red-400' : gameState.isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {gameState.isError ? <XCircle size={18} /> : gameState.isSuccess ? <CheckCircle2 size={18} /> : <TerminalIcon size={18} />}
                </div>
                <div className="text-[10px] font-black tracking-tight">{gameState.message}</div>
              </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col bg-slate-900/10 border border-white/5 min-h-0">
               <div className="px-6 py-3 border-b border-white/5 bg-slate-900/30 flex items-center gap-3 shrink-0">
                  <MessageSquare size={14} className="text-indigo-400" />
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-white">AI Analyst</h3>
               </div>
               <div className="flex-1 p-6 overflow-y-auto min-h-0">
                  {isAiLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-3 bg-slate-800 rounded w-full"></div>
                      <div className="h-3 bg-slate-800 rounded w-4/5"></div>
                    </div>
                  ) : aiFeedback ? (
                    <p className="text-slate-300 text-sm italic font-medium leading-relaxed">"{aiFeedback}"</p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                       <Zap size={48} />
                    </div>
                  )}
               </div>
               <div className="p-4 bg-slate-950/80 border-t border-white/5 h-24 overflow-hidden flex flex-col shrink-0">
                  <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-1 jetbrains-mono text-[8px]">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex gap-3 ${log.type === 'warn' ? 'text-amber-500/80' : log.type === 'success' ? 'text-emerald-500/80' : 'text-slate-700'}`}>
                        <span className="opacity-20">[{new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 1 } as any)}]</span>
                        <span className="font-medium uppercase">{log.msg}</span>
                      </div>
                    ))}
                  </div>
               </div>
               {gameState.isSuccess && (
                 <div className="p-4 bg-emerald-500/10 border-t border-white/5 shrink-0">
                   <button onClick={() => { if (currentLevelIdx < LEVELS.length - 1) setCurrentLevelIdx(currentLevelIdx + 1); }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[9px] uppercase tracking-widest flex items-center justify-center gap-3">
                     Next Vector <ChevronRight size={14} />
                   </button>
                 </div>
               )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
