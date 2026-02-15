
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { Task, InkData } from '../types';
import DrawingCanvas from './DrawingCanvas';

interface MonthlyPageProps {
  date: Date;
  tasks: Task[];
  inks: InkData[];
  onDayClick: (date: Date) => void;
  penConfig: { isActive: boolean; color: string; size: number; isEraser: boolean; onSave: (date: string, url: string) => void };
}

const MonthlyPage: React.FC<MonthlyPageProps> = ({ date, tasks, inks, onDayClick, penConfig }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group days by weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Left page: Mon, Tue, Wed
  // Right page: Thu, Fri, Sat, Sun
  const leftPageDays = weeks.flatMap(week => week.slice(0, 3));
  const rightPageDays = weeks.flatMap(week => week.slice(3, 7));

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const renderSide = (sideDays: Date[], isRight: boolean) => {
    const pageId = `monthly-${format(date, 'yyyy-MM')}-${isRight ? 'R' : 'L'}`;
    const initialData = inks.find(i => i.date === pageId)?.dataUrl;
    const colCount = isRight ? 4 : 3;
    const sideDayNames = isRight ? dayNames.slice(3) : dayNames.slice(0, 3);

    return (
      <div className={`flex-1 h-full paper-texture p-6 md:p-10 flex flex-col relative ${isRight ? 'border-l border-zinc-100' : ''}`}>
        {/* Grid Container with White Border/Margin */}
        <div className="absolute inset-6 md:inset-10 bg-grid border border-zinc-200 pointer-events-none rounded-sm"></div>

        <DrawingCanvas 
          id={pageId}
          isActive={penConfig.isActive}
          color={penConfig.color}
          brushSize={penConfig.size}
          isEraser={penConfig.isEraser}
          initialData={initialData}
          onSave={(url) => penConfig.onSave(pageId, url)}
        />
        
        {/* Page Content */}
        <div className="relative z-10 flex flex-col h-full mx-4 mb-4 mt-2">
          {/* Calendar Grid Header */}
          <div className={`grid ${isRight ? 'grid-cols-4' : 'grid-cols-3'} border-b border-zinc-300`}>
            {sideDayNames.map(name => (
              <div key={name} className="py-2 text-center text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase border-r last:border-r-0 border-zinc-200">
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Grid Body */}
          <div className={`grid ${isRight ? 'grid-cols-4' : 'grid-cols-3'} border-l border-b border-zinc-200 flex-grow`}>
            {sideDays.map((day, idx) => {
              const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => !penConfig.isActive && onDayClick(day)}
                  className={`
                    relative border-r border-t border-zinc-200 transition-colors bg-white/40
                    ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                    ${!penConfig.isActive ? 'cursor-pointer hover:bg-zinc-50/50' : ''}
                    flex flex-col p-2 min-h-0
                  `}
                  style={{ aspectRatio: '1/1.1' }} // Slightly taller than wide to look square on tablet spread
                >
                  <span className={`text-xs serif mb-1 self-start ${isToday ? 'bg-zinc-800 text-white px-1.5 py-0.5 rounded' : 'text-zinc-500'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex-grow flex flex-col gap-0.5 overflow-hidden">
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} className="text-[9px] truncate text-zinc-400 flex items-center gap-1 leading-tight">
                        <div className={`w-1 h-1 rounded-full ${t.completed ? 'bg-zinc-200' : 'bg-zinc-400'}`}></div>
                        <span className={t.completed ? 'line-through opacity-40' : ''}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer Page Label */}
          <div className="mt-auto pt-4 flex justify-between items-baseline opacity-30 select-none">
             <div className="text-[7px] tracking-[0.3em] font-bold text-zinc-500 uppercase">
               {isRight ? 'ZENITH - PAGE R' : 'ZENITH - PAGE L'}
             </div>
             {!isRight && (
               <div className="serif text-xs italic text-zinc-500">
                 {format(date, 'MMMM yyyy')}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSide(leftPageDays, false)}
      {renderSide(rightPageDays, true)}
    </>
  );
};

export default MonthlyPage;
