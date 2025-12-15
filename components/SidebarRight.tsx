
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface SidebarRightProps {
  notes: string;
  setNotes: (notes: string) => void;
  focusPoints: Note[];
  toggleFocusPoint: (id: string) => void;
  onAddPoint: () => void;
  onUpdatePoint: (id: string, text: string) => void;
  onDeletePoint: (id: string) => void;
  isOpen: boolean; // For mobile toggle & desktop state
  onClose: () => void; // For mobile close
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ 
  notes, 
  setNotes, 
  focusPoints, 
  toggleFocusPoint,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  isOpen,
  onClose
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(focusPoints.length);

  // Auto-scroll and edit when a new point is added
  useEffect(() => {
      if (focusPoints.length > prevCountRef.current) {
          // A point was added
          const lastPoint = focusPoints[focusPoints.length - 1];
          setEditingId(lastPoint.id);
          
          // Scroll to bottom
          setTimeout(() => {
              if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
          }, 100);
      }
      prevCountRef.current = focusPoints.length;
  }, [focusPoints.length]);
  
  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            ></div>
        )}

        {/* Sidebar Container
            Desktop: Transition width between 0 and a larger responsive width.
            Expanded width: w-80 (mobile/tablet), lg:w-96 (desktop), xl:w-[25vw] (wide screens).
            Mobile: Fixed overlay behavior (translate X).
        */}
        <aside className={`
            fixed lg:static inset-y-0 right-0 z-40
            bg-sidebar-dark border-l border-white/5 shadow-2xl
            flex flex-col 
            transform lg:transform-none transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0 w-80 lg:w-96 xl:w-[25vw]' : 'translate-x-full lg:translate-x-0 w-80 lg:w-0'}
            lg:overflow-hidden
        `}>
          {/* Inner Wrapper: Fixed min-width to prevent squashing during transition */}
          <div className="w-80 lg:w-96 xl:w-[25vw] flex-shrink-0 flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-white mb-1">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    <h2 className="font-bold text-lg">Commentary</h2>
                    </div>
                    <p className="text-xs text-white/40">Add notes for this play strategy.</p>
                </div>
                {/* Pin/Close Button */}
                <button 
                    onClick={onClose}
                    className="text-white/30 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                    title={isOpen ? "Unpin / Close" : "Pin"}
                >
                    <span className="material-symbols-outlined text-[20px] lg:text-[24px]">
                        {isOpen ? 'last_page' : 'first_page'}
                    </span>
                </button>
            </div>

            <div ref={scrollContainerRef} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Text Area */}
                <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest">Tactical Notes</label>
                <textarea 
                    className="w-full h-40 bg-[#1c2620] border border-white/10 rounded-md p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none transition-all custom-scrollbar"
                    placeholder="Describe the sequence of shots and player movement..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                </div>

                {/* Check List */}
                <div className="space-y-3 pb-6">
                <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest">Focus Points</label>
                
                {focusPoints.map((point) => (
                    <div 
                    key={point.id}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-colors group relative ${
                        point.completed 
                        ? 'bg-[#1c2620] border-primary/20' 
                        : 'bg-[#1c2620]/50 border-white/5 hover:bg-[#1c2620]'
                    }`}
                    >
                    <div 
                        onClick={() => toggleFocusPoint(point.id)}
                        className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
                        point.completed 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'border-white/20 text-transparent group-hover:border-primary group-hover:text-primary/50'
                    }`}>
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        {editingId === point.id ? (
                            <input 
                                autoFocus
                                type="text"
                                className="w-full bg-transparent text-white text-xs border-b border-primary outline-none pb-1"
                                value={point.text}
                                onChange={(e) => onUpdatePoint(point.id, e.target.value)}
                                onBlur={() => setEditingId(null)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingId(null);
                                }}
                            />
                        ) : (
                            <p 
                                onClick={() => setEditingId(point.id)}
                                className={`text-xs leading-relaxed transition-colors cursor-text hover:text-white/90 break-words ${
                                point.completed ? 'text-white' : 'text-white/70'
                                }`}
                            >
                                {point.text}
                            </p>
                        )}
                    </div>
                    
                    {/* Delete Action */}
                    <button 
                        onClick={(e) => {
                             e.stopPropagation();
                             onDeletePoint(point.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-500 transition-all ml-1"
                        title="Delete point"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    </div>
                ))}

                {/* Add new point button */}
                <button 
                    type="button"
                    onClick={onAddPoint}
                    className="w-full flex items-center gap-3 p-3 rounded-md border border-dashed border-white/10 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all text-white/30 hover:text-white/50"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span className="text-xs">Add point</span>
                </button>
                </div>
            </div>
          </div>
        </aside>
    </>
  );
};
