
import React, { useState, useEffect } from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Badminton Formations",
    description: "Use the presets in the sidebar to instantly set up standard Doubles or Singles formations for Serving or Receiving.",
  },
  {
    title: "Position Markers",
    description: "Drag numbered Markers from the sidebar onto the court to highlight specific zones or player targets.",
  },
  {
    title: "Shuttlecock Snap",
    description: "Drag a Shuttlecock onto the court. Drop it near a Player to automatically snap it to their hand.",
  },
  {
    title: "Draw Lines",
    description: "Click and drag anywhere on the court background to draw shot trajectories or movement lines.",
  },
  {
    title: "Remove Items",
    description: "Double-click any item to remove it instantly, or drag it into the Trash Bin in the sidebar.",
  }
];

/* --- Constants for Styles --- */
const COURT_BG = "bg-court-green";
const SIDEBAR_BG = "bg-sidebar-dark";
const PLAYER_ICON = "accessibility_new";
const CURSOR_ICON = "touch_app";

/* --- Animated Visual Components --- */

const VisualFormation = () => (
    <div className={`relative w-full h-full flex overflow-hidden rounded-xl border border-white/5 ${COURT_BG}`}>
        {/* Court Lines Background */}
        <div className="absolute inset-0 opacity-30" 
             style={{ 
                 backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)`, 
                 backgroundSize: '100% 100%',
                 backgroundPosition: 'center'
             }}>
             <div className="absolute top-0 bottom-0 w-[2px] bg-white left-[8%]"></div>
             <div className="absolute top-0 bottom-0 w-[2px] bg-white right-[8%]"></div>
             <div className="absolute left-0 right-0 h-[2px] bg-white top-[10%]"></div>
             <div className="absolute left-0 right-0 h-[2px] bg-white bottom-[10%]"></div>
             <div className="absolute top-0 bottom-0 w-[2px] bg-white left-1/2 -translate-x-1/2"></div>
        </div>
        
        {/* Sidebar Mock */}
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-32 bg-[#1c2620] border border-white/10 rounded-md flex flex-col gap-2 p-2 z-20 shadow-xl`}>
            <div className="text-[8px] font-bold text-[#9eb7a8] uppercase tracking-widest text-center">Formations</div>
            <div className="flex gap-1">
                <div className="h-4 flex-1 bg-white/10 rounded-sm"></div>
                <div className="h-4 flex-1 bg-primary/20 border border-primary/50 rounded-sm animate-pulse"></div>
            </div>
            <div className="flex gap-1">
                <div className="h-4 flex-1 bg-white/10 rounded-sm"></div>
                <div className="h-4 flex-1 bg-white/10 rounded-sm"></div>
            </div>
        </div>

        {/* Players appearing on court */}
        <div className="absolute inset-0 z-10">
            {/* Player 1 - Red */}
            <div className="absolute top-[60%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-formation-p1">
                <span className="material-symbols-outlined text-red-600 text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            </div>
            {/* Player 2 - Blue */}
            <div className="absolute top-[60%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-formation-p2">
                <span className="material-symbols-outlined text-blue-600 text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            </div>
            {/* Player 3 - Yellow */}
            <div className="absolute top-[30%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-formation-p3">
                <span className="material-symbols-outlined text-yellow-400 text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            </div>
            {/* Player 4 - Orange */}
            <div className="absolute top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-formation-p4">
                <span className="material-symbols-outlined text-orange-500 text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            </div>
        </div>

        <style>{`
            @keyframes formation-move-1 {
                0% { top: 60%; left: 25%; opacity: 0; transform: scale(0) translate(-50%, -50%); }
                20% { top: 60%; left: 25%; opacity: 1; transform: scale(1) translate(-50%, -50%); }
                50% { top: 70%; left: 55%; opacity: 1; transform: scale(1) translate(-50%, -50%); }
                80% { top: 70%; left: 55%; opacity: 1; transform: scale(1) translate(-50%, -50%); }
                100% { top: 60%; left: 25%; opacity: 0; transform: scale(0) translate(-50%, -50%); }
            }
            .animate-formation-p1 { animation: formation-move-1 4s infinite ease-in-out; }
            .animate-formation-p2 { animation: formation-move-1 4s infinite ease-in-out 0.1s reverse; }
            .animate-formation-p3 { animation: formation-move-1 4s infinite ease-in-out 0.2s; }
            .animate-formation-p4 { animation: formation-move-1 4s infinite ease-in-out 0.3s reverse; }
        `}</style>
    </div>
);

const VisualMarkerDrag = () => (
    <div className={`relative w-full h-full flex overflow-hidden border border-white/5 rounded-xl ${COURT_BG}`}>
        {/* Sidebar Mock */}
        <div className={`w-24 h-full ${SIDEBAR_BG} border-r border-white/10 flex flex-col items-center pt-8 gap-4 z-20 shadow-xl`}>
            {/* Other Tools */}
            <div className="w-8 h-8 opacity-20 bg-white/10 rounded-sm"></div>
            {/* Marker Source */}
            <div className="relative p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-300">
                    <span className="text-black font-bold text-[10px]">1</span>
                </div>
            </div>
            <div className="w-8 h-8 opacity-20 bg-white/10 rounded-sm"></div>
        </div>

        {/* Court Area */}
        <div className="flex-1 relative">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
             
             {/* Animated Marker */}
             <div className="absolute z-30 animate-marker-drag flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.4)] border border-gray-300">
                     <span className="text-black font-bold text-xs">1</span>
                 </div>
                 {/* Cursor Overlay */}
                 <span className="material-symbols-outlined absolute top-4 left-4 text-white drop-shadow-md text-2xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{CURSOR_ICON}</span>
             </div>
        </div>
        <style>{`
            @keyframes marker-drag {
                0% { top: 45px; left: -15px; transform: scale(1); opacity: 0; }
                10% { top: 45px; left: -15px; transform: scale(1); opacity: 1; }
                15% { top: 45px; left: -15px; transform: scale(0.9); }
                50% { top: 50%; left: 50%; transform: scale(0.9); }
                70% { top: 50%; left: 50%; transform: scale(1); }
                90% { top: 50%; left: 50%; transform: scale(1); opacity: 1; }
                100% { top: 50%; left: 50%; transform: scale(1); opacity: 0; }
            }
            .animate-marker-drag { animation: marker-drag 3s infinite ease-in-out; }
        `}</style>
    </div>
);

const VisualShuttleSnap = () => (
    <div className={`relative w-full h-full ${COURT_BG} overflow-hidden border border-white/5 rounded-xl flex items-center justify-center`}>
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
       
       {/* Player Target */}
       <div className="relative flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-blue-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            {/* Snap Zone Visualizer */}
            <div className="absolute w-20 h-20 rounded-full border border-white/20 bg-white/5 animate-pulse"></div>
       </div>

       {/* Shuttle Draggable */}
       <div className="absolute z-30 animate-shuttle-snap">
             <div className="rotate-45 drop-shadow-lg w-8 h-8">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                    <path d="M8 19C8 21.2 9.8 23 12 23C14.2 23 16 21.2 16 19H8Z" />
                    <path d="M16 18L19.5 4L16.5 4L14.5 12L13.5 4L10.5 4L9.5 12L7.5 4L4.5 4L8 18H16Z" />
                    <path d="M6 10H18" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                    <path d="M7 14H17" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                </svg>
             </div>
             <span className="material-symbols-outlined absolute top-4 left-4 text-white drop-shadow-md text-2xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{CURSOR_ICON}</span>
       </div>

       <style>{`
            @keyframes shuttle-snap {
                0% { top: 20%; left: 20%; transform: translate(0,0); }
                40% { top: 40%; left: 40%; transform: translate(0,0); } /* Approach */
                50% { top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); } /* Snap! */
                80% { top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); }
                100% { top: 20%; left: 20%; transform: translate(0,0); }
            }
            .animate-shuttle-snap { animation: shuttle-snap 4s infinite ease-in-out; }
       `}</style>
    </div>
);

const VisualLineDraw = () => (
     <div className={`relative w-full h-full ${COURT_BG} overflow-hidden border border-white/5 rounded-xl`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Drawn Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
                <marker id="arrowhead-yellow" markerHeight="4" markerWidth="6" orient="auto" refX="5" refY="2">
                    <polygon fill="#facc15" points="0 0, 6 2, 0 4"></polygon>
                </marker>
            </defs>
            <line 
                x1="30%" y1="70%" 
                x2="70%" y2="30%" 
                stroke="#facc15" 
                strokeWidth="4" 
                strokeLinecap="round"
                markerEnd="url(#arrowhead-yellow)"
                className="animate-draw-line"
            />
            {/* Start Dot */}
            <circle cx="30%" cy="70%" r="4" fill="#facc15" className="animate-draw-dots" />
        </svg>

        {/* Cursor */}
        <div className="absolute z-20 animate-cursor-draw">
             <span className="material-symbols-outlined text-white drop-shadow-md text-3xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{CURSOR_ICON}</span>
        </div>

        <style>{`
            @keyframes draw-line {
                0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; opacity: 0; }
                10% { stroke-dasharray: 1000; stroke-dashoffset: 1000; opacity: 1; }
                60% { stroke-dasharray: 1000; stroke-dashoffset: 0; opacity: 1; }
                100% { stroke-dasharray: 1000; stroke-dashoffset: 0; opacity: 1; }
            }
            @keyframes draw-dots {
                0%, 10% { opacity: 0; }
                11% { opacity: 1; }
                100% { opacity: 1; }
            }
            @keyframes cursor-draw {
                0% { top: 70%; left: 30%; transform: translate(-10%, -10%); opacity: 0; }
                10% { top: 70%; left: 30%; transform: translate(-10%, -10%); opacity: 1; }
                60% { top: 30%; left: 70%; transform: translate(-10%, -10%); opacity: 1; }
                80% { top: 30%; left: 70%; transform: translate(-10%, -10%); opacity: 1; }
                100% { top: 30%; left: 70%; transform: translate(-10%, -10%); opacity: 0; }
            }
            .animate-draw-line { animation: draw-line 3s infinite ease-in-out; }
            .animate-draw-dots { animation: draw-dots 3s infinite ease-in-out; }
            .animate-cursor-draw { animation: cursor-draw 3s infinite ease-in-out; }
        `}</style>
     </div>
);

const VisualDelete = () => (
    <div className={`relative w-full h-full ${COURT_BG} overflow-hidden border border-white/5 rounded-xl flex flex-col items-center justify-center gap-6`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* Item to be deleted */}
        <div className="absolute animate-delete-item flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-red-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>{PLAYER_ICON}</span>
            <span className="text-white font-bold drop-shadow-md mt-1">P1</span>
        </div>

        {/* Cursor Double Click */}
        <div className="absolute z-20 animate-double-click">
             <span className="material-symbols-outlined text-white drop-shadow-md text-3xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{CURSOR_ICON}</span>
             <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 animate-click-ring"></div>
             <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 animate-click-ring delay-150"></div>
        </div>

        <style>{`
            @keyframes double-click-move {
                0% { transform: translate(30px, 30px); opacity: 0; }
                20% { transform: translate(30px, 30px); opacity: 1; }
                30% { transform: translate(0, 0); opacity: 1; }
                40% { transform: scale(0.9); } /* Click 1 */
                50% { transform: scale(1); }
                60% { transform: scale(0.9); } /* Click 2 */
                80% { opacity: 1; }
                100% { opacity: 0; }
            }

            @keyframes delete-vanish {
                0%, 60% { transform: scale(1); opacity: 1; }
                65% { transform: scale(1.1); opacity: 1; }
                75% { transform: scale(0); opacity: 0; }
                100% { transform: scale(0); opacity: 0; }
            }
            
            @keyframes click-ring {
                0%, 40% { opacity: 0; transform: scale(0.5); }
                41% { opacity: 1; transform: scale(1); }
                60% { opacity: 0; transform: scale(1.5); }
                100% { opacity: 0; }
            }
            .animate-delete-item { animation: delete-vanish 3s infinite; }
            .animate-double-click { animation: double-click-move 3s infinite; }
            .animate-click-ring { animation: click-ring 3s infinite; }
        `}</style>
    </div>
);


export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step when opened
  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-sidebar-dark border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative min-h-[550px]">
        
        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-white/5">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full transition-all duration-300 ${idx <= currentStep ? 'bg-primary' : 'bg-transparent'}`}
              style={{ width: `${100 / TUTORIAL_STEPS.length}%` }}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col items-center text-center">
            
            {/* Visual Container */}
            <div className="w-full h-64 mb-8 shadow-2xl">
                {currentStep === 0 && <VisualFormation />}
                {currentStep === 1 && <VisualMarkerDrag />}
                {currentStep === 2 && <VisualShuttleSnap />}
                {currentStep === 3 && <VisualLineDraw />}
                {currentStep === 4 && <VisualDelete />}
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-3 animate-in slide-in-from-bottom-2 fade-in duration-500 key={step.title}">
              {step.title}
            </h2>
            
            <p className="text-white/60 text-base leading-relaxed max-w-lg animate-in slide-in-from-bottom-4 fade-in duration-700 key={step.description}">
              {step.description}
            </p>

        </div>

        {/* Footer Controls */}
        <div className="p-6 bg-[#0d120f]/50 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Empty spacer for alignment */}
            <div className="hidden md:block w-32"></div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
               {currentStep > 0 && (
                 <button 
                   onClick={handlePrev}
                   className="px-6 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
                 >
                   Back
                 </button>
               )}
               
               <button 
                 onClick={handleNext}
                 className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-primary text-sidebar-dark hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
               >
                 {currentStep === TUTORIAL_STEPS.length - 1 ? "Got it" : "Next"}
                 {currentStep < TUTORIAL_STEPS.length - 1 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
               </button>
            </div>

             {/* Empty spacer for alignment */}
             <div className="hidden md:block w-32"></div>
        </div>

        {/* Absolute Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors z-50"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

      </div>
    </div>
  );
};
