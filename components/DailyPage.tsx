
import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Task, InkData } from '../types';
import DrawingCanvas from './DrawingCanvas';

interface DailyPageProps {
  leftDate: Date;
  rightDate: Date;
  tasks: Task[];
  inks: InkData[];
  onAddTask: (text: string, date: string, time?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  penConfig: { isActive: boolean; color: string; size: number; isEraser: boolean; onSave: (date: string, url: string) => void };
}

const DayTemplate: React.FC<{
  date: Date;
  tasks: Task[];
  inks: InkData[];
  onAddTask: (text: string, date: string, time?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  penConfig: DailyPageProps['penConfig'];
  isRightPage?: boolean;
}> = ({ date, tasks, inks, onAddTask, onToggleTask, onDeleteTask, penConfig, isRightPage }) => {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), date));
  const initialData = inks.find(i => i.date === dateStr)?.dataUrl;

  return (
    <div className={`flex-1 h-full paper-texture p-6 md:p-8 flex flex-col relative ${isRightPage ? 'pl-8' : 'pr-8 border-r border-zinc-100'}`}>
      {/* Grid Container with White Border/Margin */}
      <div className="absolute inset-6 md:inset-8 bg-grid border border-zinc-200 pointer-events-none rounded-sm"></div>
      
      <DrawingCanvas 
        id={dateStr}
        isActive={penConfig.isActive}
        color={penConfig.color}
        brushSize={penConfig.size}
        isEraser={penConfig.isEraser}
        initialData={initialData}
        onSave={(url) => penConfig.onSave(dateStr, url)}
      />

      {/* Header - Positioned relative to page padding */}
      <div className="mb-10 flex justify-between items-end relative z-10 select-none px-4 pt-4">
        <div>
          <h2 className="serif text-6xl md:text-7xl font-light text-zinc-800 leading-none">{format(date, 'd')}</h2>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-zinc-300 block mt-2">
            {format(date, 'EEEE')}
          </span>
        </div>
        <div className="text-right">
          <span className="serif text-base md:text-lg italic text-zinc-400 font-light tracking-wide">
            {format(date, 'MMMM yyyy')}
          </span>
        </div>
      </div>

      {/* Content Layer (z-10) */}
      <div className="relative z-10 flex-grow flex flex-col overflow-hidden px-4 pb-4">
        <div className="flex-grow flex flex-col min-h-0">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-zinc-300">Schedule</span>
            <div className="h-px flex-grow bg-zinc-100"></div>
          </div>
          
          <div className="flex-grow flex flex-col overflow-y-auto no-scrollbar">
            {hours.map(h => {
              const hourTasks = dayTasks.filter(t => t.time === h.toString());
              return (
                <div key={h} className="group flex items-start border-b border-zinc-50 min-h-[48px] py-2 hover:bg-zinc-50/30 transition-colors">
                  <div className="w-10 text-[8px] md:text-[9px] font-black text-zinc-300 pt-1 tracking-tighter">
                    {h > 12 ? `${h-12}PM` : h === 12 ? '12PM' : `${h}AM`}
                  </div>
                  <div className="flex-grow flex flex-col gap-1.5 pl-4 pr-1">
                    {hourTasks.length > 0 ? (
                      hourTasks.map(t => (
                        <div key={t.id} className="flex justify-between items-center group/item text-xs text-zinc-700 bg-white/80 backdrop-blur-sm px-2 py-1.5 rounded border border-zinc-200 shadow-sm">
                          <span className="truncate">{t.text}</span>
                          <button onClick={() => onDeleteTask(t.id)} className="opacity-0 group-hover/item:opacity-100 text-zinc-300 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <button 
                        onClick={() => {
                          const txt = prompt(`Event for ${h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}?`);
                          if(txt) onAddTask(txt, dateStr, h.toString());
                        }}
                        className="w-full text-left text-[9px] italic text-zinc-200 opacity-0 group-hover:opacity-100 h-full flex items-center"
                      >
                        + Block time
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-end border-t border-zinc-50 pt-4 relative z-10 select-none px-4 pb-2">
        <div className="text-[7px] text-zinc-200 tracking-[0.5em] uppercase font-black">Ref: Zenith.v2.DP</div>
        <div className="serif text-xs text-zinc-300 italic">{format(date, 'do MMMM')}</div>
      </div>
    </div>
  );
};

const DailyPage: React.FC<DailyPageProps> = (props) => (
  <>
    <DayTemplate date={props.leftDate} tasks={props.tasks} inks={props.inks} onAddTask={props.onAddTask} onToggleTask={props.onToggleTask} onDeleteTask={props.onDeleteTask} penConfig={props.penConfig} />
    <DayTemplate date={props.rightDate} tasks={props.tasks} inks={props.inks} onAddTask={props.onAddTask} onToggleTask={props.onToggleTask} onDeleteTask={props.onDeleteTask} penConfig={props.penConfig} isRightPage />
  </>
);

export default DailyPage;
