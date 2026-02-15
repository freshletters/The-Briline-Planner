
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkles, PenTool, Eraser, Trash2, X } from 'lucide-react';
import { Task, ViewType, InkData } from './types';
import MonthlyPage from './components/MonthlyPage';
import DailyPage from './components/DailyPage';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('monthly');
  const [penMode, setPenMode] = useState(false);
  const [penColor, setPenColor] = useState('#18181b');
  const [penSize, setPenSize] = useState(1);
  const [isEraser, setIsEraser] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenith_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inks, setInks] = useState<InkData[]>(() => {
    const saved = localStorage.getItem('zenith_inks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zenith_inks', JSON.stringify(inks));
  }, [inks]);

  const saveInk = (dateStr: string, dataUrl: string) => {
    setInks(prev => {
      const filtered = prev.filter(i => i.date !== dateStr);
      return [...filtered, { date: dateStr, dataUrl }];
    });
  };

  const navigatePrev = () => {
    if (view === 'monthly') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 2));
  };

  const navigateNext = () => {
    if (view === 'monthly') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 2));
  };

  const addTask = (text: string, date: string, time?: string) => {
    const newTask: Task = { id: crypto.randomUUID(), text, completed: false, date, time };
    setTasks(prev => [...prev, newTask]);
  };

  const handleAiAssistance = async () => {
    setIsAiLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a minimalist lifestyle coach. Suggest 3 small focus areas for ${format(currentDate, 'PPP')}. JSON array of strings.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const suggestions = JSON.parse(response.text);
      if (Array.isArray(suggestions)) suggestions.forEach(s => addTask(s, format(currentDate, 'yyyy-MM-dd')));
    } catch (error) { console.error(error); } finally { setIsAiLoading(false); }
  };

  const nextDay = addDays(currentDate, 1);

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center p-4 md:p-8 overflow-y-auto no-scrollbar">
      {/* Fixed Tablet-Optimized Toolbar */}
      {penMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 transition-all animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsEraser(false); setPenColor('#18181b'); setPenSize(1); }} 
              className={`p-3 rounded-xl transition-all ${!isEraser && penColor === '#18181b' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
            >
              <PenTool size={20} />
            </button>
            <button 
              onClick={() => { setIsEraser(false); setPenColor('#a1a1aa'); setPenSize(0.8); }} 
              className={`p-3 rounded-xl transition-all ${!isEraser && penColor === '#a1a1aa' ? 'bg-zinc-400 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
            >
              <PenTool size={20} />
            </button>
            <button 
              onClick={() => { setIsEraser(false); setPenColor('#ef4444'); setPenSize(1.2); }} 
              className={`p-3 rounded-xl transition-all ${!isEraser && penColor === '#ef4444' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
            >
              <PenTool size={20} />
            </button>
          </div>
          <div className="w-px h-8 bg-zinc-200"></div>
          <button 
            onClick={() => setIsEraser(true)} 
            className={`p-3 rounded-xl transition-all ${isEraser ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
          >
            <Eraser size={20} />
          </button>
          <div className="w-px h-8 bg-zinc-200"></div>
          <button onClick={() => setPenMode(false)} className="p-3 text-zinc-400 hover:text-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <div className="w-full max-w-7xl mb-8 flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-6">
          <h1 className="serif text-4xl md:text-5xl font-light text-zinc-800">
            {format(currentDate, 'MMMM')} <span className="opacity-30">{format(currentDate, 'yyyy')}</span>
          </h1>
          <div className="flex bg-white shadow-sm rounded-full border border-zinc-200 p-1">
            <button onClick={() => setView('monthly')} className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${view === 'monthly' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>MONTHLY</button>
            <button onClick={() => setView('daily')} className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${view === 'daily' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>DAILY</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setPenMode(!penMode); setIsEraser(false); }} className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl text-xs font-bold tracking-widest transition-all shadow-sm ${penMode ? 'bg-zinc-800 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            <PenTool size={16} />
            PEN MODE
          </button>
          <button onClick={handleAiAssistance} disabled={isAiLoading} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold tracking-widest text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 shadow-sm">
            <Sparkles size={16} className={isAiLoading ? "animate-pulse" : ""} />
            AI ASSIST
          </button>
          <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button onClick={navigatePrev} className="p-2.5 hover:bg-zinc-50 transition-colors border-r border-zinc-100"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-800 uppercase tracking-widest">TODAY</button>
            <button onClick={navigateNext} className="p-2.5 hover:bg-zinc-50 transition-colors border-l border-zinc-100"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Taller Tablet-Friendly Spread */}
      <div className="w-full max-w-7xl min-h-[85vh] md:min-h-[800px] bg-white rounded-2xl shadow-2xl flex relative overflow-hidden ring-1 ring-zinc-200">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-20 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent pointer-events-none z-30"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-100 z-30 pointer-events-none"></div>
        
        {view === 'monthly' ? (
          <MonthlyPage 
            date={currentDate} 
            tasks={tasks} 
            inks={inks}
            onDayClick={(d) => { setCurrentDate(d); setView('daily'); }} 
            penConfig={{ isActive: penMode, color: penColor, size: penSize, isEraser, onSave: saveInk }}
          />
        ) : (
          <DailyPage 
            leftDate={currentDate} 
            rightDate={nextDay} 
            tasks={tasks} 
            inks={inks}
            onAddTask={addTask} 
            onToggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} 
            onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))} 
            penConfig={{ isActive: penMode, color: penColor, size: penSize, isEraser, onSave: saveInk }}
          />
        )}
      </div>

      <div className="py-12 flex flex-col items-center gap-2">
        <p className="text-zinc-400 text-[10px] tracking-[0.5em] uppercase font-bold">Zenith Stationery & Co.</p>
        <p className="text-zinc-300 text-[8px] uppercase tracking-widest">Minimalist Design • High Fidelity Digital Planning</p>
      </div>
    </div>
  );
};

export default App;
