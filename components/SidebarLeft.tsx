
import React, { useState, useEffect } from 'react';
import { ItemType, LineType } from '../types';
import { MAX_PLAYERS, MAX_MARKERS, MAX_SHUTTLES, LINE_COLORS } from '../constants';

interface SidebarLeftProps {
  onDragStart: (e: React.DragEvent, type: ItemType) => void;
  onTrashDrop: (e: React.DragEvent) => void;
  onClearAll: () => void;
  onClearPlayers: () => void;
  onClearMarkers: () => void;
  onOpenFeedback: () => void;
  onToggleNotes: () => void;
  onLogout: () => void;
  isNotesOpen: boolean;
  playerCount: number;
  markerCount: number;
  shuttleCount?: number;
  nextMarkerLabel: string;
  nextPlayerColor: string;
  activeLineColor: string;
  setActiveLineColor: (color: string) => void;
  activeLineType: LineType;
  setActiveLineType: (type: LineType) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  strategyName: string;
  onUpdateStrategyName: (name: string) => void;
  onOpenTutorial: () => void;
  onApplyPreset: (presetKey: string) => void;
}

type GameType = 'SINGLES' | 'DOUBLES';
type Situation = 'SERVE' | 'RECV';
type Side = 'EVEN' | 'ODD';

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  onDragStart, 
  onTrashDrop,
  onClearAll,
  onClearPlayers,
  onClearMarkers,
  onOpenFeedback,
  onToggleNotes,
  onLogout,
  isNotesOpen,
  playerCount,
  markerCount,
  shuttleCount = 0,
  nextMarkerLabel,
  nextPlayerColor,
  activeLineColor,
  setActiveLineColor,
  activeLineType,
  setActiveLineType,
  isLocked,
  onToggleLock,
  strategyName,
  onUpdateStrategyName,
  onOpenTutorial,
  onApplyPreset,
}) => {
  
  const [gameType, setGameType] = useState<GameType>('SINGLES');
  const [situation, setSituation] = useState<Situation>('SERVE');
  const [side, setSide] = useState<Side>('EVEN');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLocked) {
        e.dataTransfer.dropEffect = 'move';
    }
  };

  // Effect to apply preset when configuration changes
  // We use a specific function triggered by clicks to avoid initial render loops or unwanted resets
  const applyPresetConfig = (newGameType: GameType, newSituation: Situation, newSide: Side) => {
      let key = '';
      if (newGameType === 'SINGLES') {
          // SINGLES_SERVE_RIGHT (Even) / LEFT (Odd)
          const sideSuffix = newSide === 'EVEN' ? 'RIGHT' : 'LEFT';
          key = `SINGLES_${newSituation}_${sideSuffix}`;
      } else {
          // MD_SERVE_EVEN / ODD
          key = `MD_${newSituation}_${newSide}`;
      }
      onApplyPreset(key);
  };

  const updateConfig = (updates: { gameType?: GameType, situation?: Situation, side?: Side }) => {
      const nextGameType = updates.gameType ?? gameType;
      const nextSituation = updates.situation ?? situation;
      const nextSide = updates.side ?? side;

      setGameType(nextGameType);
      setSituation(nextSituation);
      setSide(nextSide);
      
      applyPresetConfig(nextGameType, nextSituation, nextSide);
  };

  const canAddPlayer = playerCount < MAX_PLAYERS && !isLocked;
  const canAddMarker = markerCount < MAX_MARKERS && !isLocked;
  const canAddShuttle = shuttleCount < MAX_SHUTTLES && !isLocked;

  // Convert bg- color class to text- color class
  const playerColorClass = nextPlayerColor.replace('bg-', 'text-');

  // Toggle Button Component
  const ToggleButton = ({ 
      active, 
      label, 
      onClick, 
      icon 
  }: { active: boolean, label: string, onClick: () => void, icon?: string }) => (
      <button
          onClick={onClick}
          className={`flex-1 h-8 md:h-[3vw] text-[11px] md:text-[0.8vw] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center ${label ? 'gap-1.5' : ''} ${
              active 
              ? 'bg-white/10 text-white shadow-sm' 
              : 'text-white/30 hover:text-white/70'
          }`}
          title={label || undefined}
      >
          {icon && <span className="material-symbols-outlined text-[16px] md:text-[1.2vw]">{icon}</span>}
          {label}
      </button>
  );

  return (
    <aside className="w-14 md:w-[15vw] flex-shrink-0 flex flex-col bg-sidebar-dark border-r border-white/5 h-full z-20 custom-scrollbar relative shadow-2xl transition-all duration-300 select-none">
      {/* Header */}
      <div className="p-2 md:py-[1.5vw] flex flex-col items-center justify-center border-b border-white/5 md:gap-[0.5vw]">
        <span className="material-symbols-outlined text-primary text-2xl md:text-[3.5vw]">sports_tennis</span>
        
        {/* Editable Strategy Name */}
        <div className="hidden md:block w-full px-[1vw]">
            <input 
                type="text"
                value={strategyName}
                onChange={(e) => onUpdateStrategyName(e.target.value)}
                className="w-full bg-transparent text-white text-xs md:text-[1.1vw] font-bold leading-tight text-center tracking-tight border-b border-transparent hover:border-white/20 focus:border-primary focus:outline-none transition-all py-[0.5vw]"
                placeholder="Name"
            />
        </div>
        <span className="md:hidden text-white text-[9px] font-bold text-center tracking-widest uppercase">Tactics</span>
      </div>

      {/* Draggable Tools & Settings */}
      <div className="px-1 md:px-[1vw] py-2 md:py-[1.5vw] space-y-2 md:space-y-[2vw] flex-1 flex flex-col items-center overflow-y-auto custom-scrollbar">
        
        {/* Presets - Configurator */}
        <div className={`w-full flex flex-col gap-2 md:gap-[0.8vw] ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
             <div className="hidden md:block text-[12px] md:text-[0.9vw] font-bold text-[#9eb7a8] uppercase tracking-widest text-center mb-[0.2vw]">
                Formations
             </div>
             
             {/* Configuration Panel - Squarish Container */}
             <div className="flex flex-col gap-1.5 md:gap-[0.6vw] bg-[#1c2620] p-1.5 md:p-[0.6vw] rounded-md border border-white/5 w-full">
                 
                 {/* Row 1: Game Type */}
                 <div className="flex w-full gap-1.5">
                     <ToggleButton 
                        active={gameType === 'SINGLES'} 
                        label="" 
                        onClick={() => updateConfig({ gameType: 'SINGLES' })} 
                        icon="person"
                     />
                     <ToggleButton 
                        active={gameType === 'DOUBLES'} 
                        label="" 
                        onClick={() => updateConfig({ gameType: 'DOUBLES' })} 
                        icon="group"
                     />
                 </div>

                 {/* Row 2: Situation */}
                 <div className="flex w-full gap-1.5">
                     <ToggleButton 
                        active={situation === 'SERVE'} 
                        label="Serve" 
                        onClick={() => updateConfig({ situation: 'SERVE' })} 
                     />
                     <ToggleButton 
                        active={situation === 'RECV'} 
                        label="Receive" 
                        onClick={() => updateConfig({ situation: 'RECV' })} 
                     />
                 </div>

                 {/* Row 3: Side - ODD (Left) then EVEN (Right) */}
                 <div className="flex w-full gap-1.5">
                     <ToggleButton 
                        active={side === 'ODD'} 
                        label="Odd (L)" 
                        onClick={() => updateConfig({ side: 'ODD' })} 
                     />
                     <ToggleButton 
                        active={side === 'EVEN'} 
                        label="Even (R)" 
                        onClick={() => updateConfig({ side: 'EVEN' })} 
                     />
                 </div>
             </div>
        </div>

        <div className="w-6 md:w-[8vw] h-px bg-white/5 my-0.5"></div>

        {/* Shuttle Tool */}
        <div 
          className={`w-full flex flex-col items-center group transition-all ${canAddShuttle ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'opacity-40 cursor-not-allowed filter grayscale'}`}
          draggable={canAddShuttle}
          onDragStart={(e) => canAddShuttle && onDragStart(e, ItemType.SHUTTLE)}
          title="Drag to add Shuttle"
        >
           <div className="relative p-1 flex items-center justify-center">
             {/* Resized to 22px (approx 30% smaller than 32px) */}
             <div className="w-[22px] h-[22px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-white drop-shadow-md rotate-45">
                   <path d="M8 19C8 21.2 9.8 23 12 23C14.2 23 16 21.2 16 19H8Z" />
                   <path d="M16 18L19.5 4L16.5 4L14.5 12L13.5 4L10.5 4L9.5 12L7.5 4L4.5 4L8 18H16Z" />
                   <path d="M6 10H18" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                   <path d="M7 14H17" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                </svg>
             </div>
           </div>
        </div>

        {/* New Player Tool */}
        <div 
          className={`w-full flex flex-col items-center group transition-all ${canAddPlayer ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'opacity-40 cursor-not-allowed filter grayscale'}`}
          draggable={canAddPlayer}
          onDragStart={(e) => canAddPlayer && onDragStart(e, ItemType.PLAYER)}
          onDoubleClick={() => !isLocked && onClearPlayers()}
          title="Drag to add Player"
        >
          <div className="relative flex items-center justify-center p-1">
             {/* Strictly 40px font size */}
            <span className={`material-symbols-outlined text-[40px] drop-shadow-md transition-colors ${playerColorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                accessibility_new
            </span>
          </div>
        </div>

        {/* New Marker Tool */}
        <div 
          className={`w-full flex flex-col items-center group transition-all ${canAddMarker ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'opacity-40 cursor-not-allowed filter grayscale'}`}
          draggable={canAddMarker}
          onDragStart={(e) => canAddMarker && onDragStart(e, ItemType.MARKER)}
          onDoubleClick={() => !isLocked && onClearMarkers()}
          title="Drag to add Marker"
        >
          <div className="relative p-1">
             {/* Resized to 23px (15% bigger than 20px) */}
             <div className="w-[23px] h-[23px] rounded-full bg-white flex items-center justify-center shadow-md border border-gray-300">
                <span className="text-black font-bold text-[10px]">{nextMarkerLabel}</span>
             </div>
          </div>
        </div>

        <div className="w-6 md:w-[8vw] h-px bg-white/5 my-0.5"></div>

        {/* Line Settings */}
        <div className={`w-full flex flex-col items-center gap-2 md:gap-[1.5vw] ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
             
             {/* Line Type Selector */}
             <div className="flex bg-[#1c2620] p-1 md:p-[0.4vw] rounded-md border border-white/5 w-full md:max-w-full flex-col md:flex-row gap-1 md:gap-[0.5vw]">
                <button
                    onClick={() => setActiveLineType(LineType.SOLID)}
                    className={`w-full md:flex-1 md:w-auto h-6 md:h-[3vw] rounded-sm flex items-center justify-center transition-all ${activeLineType === LineType.SOLID ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/70'}`}
                    title="Solid Line"
                >
                    <div className="w-5 md:w-[2.5vw] h-0.5 bg-current rounded-full"></div>
                </button>
                <button
                    onClick={() => setActiveLineType(LineType.DASHED)}
                    className={`w-full md:flex-1 md:w-auto h-6 md:h-[3vw] rounded-sm flex items-center justify-center transition-all ${activeLineType === LineType.DASHED ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/70'}`}
                    title="Dashed Line"
                >
                    <div className="w-5 md:w-[2.5vw] h-0.5 bg-current border-b-2 border-dashed border-current !bg-transparent"></div>
                </button>
             </div>

             {/* Color Swatch */}
             <div className="flex flex-wrap justify-center gap-1.5 md:gap-[1vw] max-w-[40px] md:max-w-full">
                  {LINE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setActiveLineColor(color)}
                      className={`w-3.5 h-3.5 md:w-[2vw] md:h-[2vw] rounded-full border transition-all ${activeLineColor === color ? 'border-white scale-125 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
             </div>
        </div>

         {/* Divider */}
         <div className="w-6 md:w-[8vw] h-px bg-white/5 my-0.5"></div>
         
         {/* Tools: Lock, Feedback, Notes */}
         <div className="flex flex-wrap justify-center gap-2 md:gap-[1vw]">
             <button 
                onClick={onToggleLock}
                className={`w-8 h-8 md:w-[3.5vw] md:h-[3.5vw] rounded-lg transition-all flex items-center justify-center ${isLocked ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-[#1c2620] text-white/50 hover:text-primary hover:bg-[#1c2620]/80'}`}
                title={isLocked ? "Unlock Drawing" : "Lock Drawing"}
            >
                <span className="material-symbols-outlined text-lg md:text-[2vw]">{isLocked ? 'lock' : 'lock_open'}</span>
            </button>

            <button 
                onClick={onOpenTutorial}
                className="w-8 h-8 md:w-[3.5vw] md:h-[3.5vw] rounded-lg bg-[#1c2620] text-white/50 hover:text-primary hover:bg-[#1c2620]/80 transition-all flex items-center justify-center"
                title="Open Tutorial"
            >
                <span className="material-symbols-outlined text-lg md:text-[2vw]">school</span>
            </button>

            <button 
                onClick={onToggleNotes}
                className={`w-8 h-8 md:w-[3.5vw] md:h-[3.5vw] rounded-lg flex items-center justify-center transition-all ${isNotesOpen ? 'bg-primary text-sidebar-dark' : 'bg-[#1c2620] text-white/50 hover:text-white'}`}
                title="Commentary & Notes"
            >
                <span className="material-symbols-outlined text-lg md:text-[2vw]">edit_note</span>
            </button>

            <button 
                onClick={onOpenFeedback}
                className="w-8 h-8 md:w-[3.5vw] md:h-[3.5vw] rounded-lg bg-[#1c2620] text-white/50 hover:text-primary hover:bg-[#1c2620]/80 transition-all flex items-center justify-center"
                title="Send Feedback"
            >
                <span className="material-symbols-outlined text-lg md:text-[2vw]">chat_bubble</span>
            </button>
         </div>
      </div>

      {/* Trash Bin */}
      <div className="p-1 md:p-[1.5vw] mt-auto space-y-2 md:space-y-[1.5vw]">
        <div 
          id="trash-bin-zone"
          className={`border-2 border-dashed rounded-md p-2 md:p-[1.5vw] flex flex-col items-center justify-center gap-1 md:gap-[0.5vw] transition-all group min-h-[50px] md:min-h-[12vw]
             ${isLocked 
                ? 'border-white/5 bg-[#1c2620]/20 text-white/10 cursor-not-allowed grayscale' 
                : 'border-white/10 bg-[#1c2620]/30 text-[#9eb7a8] hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer'
             }`}
          onDragOver={handleDragOver}
          onDrop={(e) => !isLocked && onTrashDrop(e)}
          onClick={() => !isLocked && onClearAll()}
          title={isLocked ? "Board Locked" : "Drop items to delete, click to clear board"}
        >
          <span className="material-symbols-outlined text-xl md:text-[3vw] group-hover:scale-110 transition-transform mb-0 md:mb-[0.5vw]">delete</span>
          <div className="text-center w-full hidden md:block">
            <span className="text-xs md:text-[0.9vw] font-bold uppercase tracking-widest block mb-[0.5vw]">Trash Bin</span>
            <div className="w-full h-px bg-white/5 mb-[0.5vw]"></div>
            <p className="text-[10px] md:text-[0.8vw] leading-tight text-white/40">
                {isLocked ? 'Locked' : 'Drop to remove'}
                {!isLocked && (
                    <>
                        <br />
                        <span className="text-white/20 group-hover:text-rose-400/70 transition-colors">Click to clear</span>
                    </>
                )}
            </p>
          </div>
        </div>

        <button 
            onClick={onLogout}
            className="w-full py-2 md:py-[1.5vw] flex items-center justify-center gap-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-colors"
        >
            <span className="material-symbols-outlined text-lg md:text-[2vw]">logout</span>
            <span className="text-xs md:text-[0.8vw] font-bold uppercase tracking-widest hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};
