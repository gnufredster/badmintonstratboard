
import React, { useState, useEffect } from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Strategy Builder",
    description: "Design tactical badminton plays, position players, and visualize movement sequences with ease.",
  },
  {
    title: "Positioning",
    description: "Drag and drop Players (P1, P2) and Shuttle Markers (1, 2) from the sidebar onto the court to set up the play.",
  },
  {
    title: "Drawing Lines",
    description: "Click and drag anywhere on the court to draw shot lines. Use the sidebar to toggle between Solid and Dashed lines.",
  },
  {
    title: "Ghost Movement",
    description: "Long Press (1s) on a Player or Path End to create a 'Ghost' movement path. This visualizes where a player moves next.",
  },
  {
    title: "Tools & Locking",
    description: "Lock the board to prevent accidental edits while viewing. Use the right sidebar to add detailed tactical notes.",
  }
];

/* --- Animated Visual Components --- */

const VisualStep0 = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0d120f] overflow-hidden rounded-xl border border-white/5">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
            <span className="material-symbols-outlined text-8xl text-primary drop-shadow-[0_0_25px_rgba(54,226,123,0.4)]">sports_tennis</span>
            <div className="mt-6 flex gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-75"></div>
                <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse delay-150"></div>
            </div>
        </div>
        <style>{`
            .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(-5%); }
                50% { transform: translateY(5%); }
            }
        `}</style>
    </div>
);

const VisualStep1 = () => (
    <div className="relative w-full h-full flex bg-[#0d120f] overflow-hidden border border-white/5 rounded-xl">
        {/* Sidebar Mock */}
        <div className="w-1/4 h-full bg-sidebar-dark border-r border-white/10 flex flex-col items-center pt-8 gap-4 z-10">
            <div className="w-10 h-10 rounded-lg bg-[#1c2620] border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/50">accessibility_new</span>
            </div>
        </div>
        {/* Court Mock */}
        <div className="flex-1 relative bg-court-green/20">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {/* Animated Item */}
             <div className="absolute w-12 h-12 bg-transparent flex items-center justify-center z-20 animate-tutorial-drag">
                 <span className="material-symbols-outlined text-5xl text-rose-500 drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>accessibility_new</span>
                 {/* Cursor Overlay */}
                 <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white drop-shadow-md text-3xl">touch_app</span>
             </div>
        </div>
        <style>{`
            .animate-tutorial-drag { animation: tutorial-drag 4s infinite ease-in-out; }
            @keyframes tutorial-drag {
                0% { top: 32px; left: 8%; transform: scale(1); } /* Start in sidebar */
                15% { top: 32px; left: 8%; transform: scale(0.9); } /* Grab */
                50% { top: 60%; left: 60%; transform: scale(0.9); } /* Drag to court */
                70% { top: 60%; left: 60%; transform: scale(1); } /* Drop */
                100% { top: 60%; left: 60%; transform: scale(1); } /* Wait */
            }
        `}</style>
    </div>
);

const VisualStep2 = () => (
     <div className="relative w-full h-full bg-court-green/20 overflow-hidden border border-white/5 rounded-xl">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Start Point Dot */}
        <div className="absolute top-[30%] left-[30%] w-3 h-3 rounded-full bg-yellow-400 shadow-sm z-10"></div>
        {/* End Point Dot */}
        <div className="absolute top-[70%] left-[70%] w-3 h-3 rounded-full bg-yellow-400 shadow-sm z-10"></div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line 
                x1="30%" y1="30%" 
                x2="70%" y2="70%" 
                stroke="#facc15" 
                strokeWidth="4" 
                className="animate-draw-line"
            />
        </svg>

        {/* Cursor */}
        <div className="absolute z-20 animate-cursor-draw">
             <span className="material-symbols-outlined text-white drop-shadow-md text-3xl">touch_app</span>
        </div>

        <style>{`
            .animate-draw-line {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw-line 3s infinite ease-in-out;
            }
            .animate-cursor-draw {
                animation: cursor-draw 3s infinite ease-in-out;
            }
            @keyframes draw-line {
                0% { stroke-dashoffset: 1000; }
                10% { stroke-dashoffset: 1000; }
                60% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes cursor-draw {
                0% { top: 30%; left: 30%; }
                10% { top: 30%; left: 30%; transform: scale(0.9); }
                60% { top: 70%; left: 70%; transform: scale(0.9); }
                70% { top: 70%; left: 70%; transform: scale(1); }
                100% { top: 70%; left: 70%; transform: scale(1); }
            }
        `}</style>
     </div>
);

const VisualStep3 = () => (
    <div className="relative w-full h-full bg-court-green/20 overflow-hidden border border-white/5 rounded-xl flex items-center justify-center">
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
       
       {/* Player Source */}
       <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-blue-600 drop-shadow-xl z-10 relative" style={{ fontVariationSettings: "'FILL' 1" }}>accessibility_new</span>
            {/* Long Press Indicator Ring */}
            <div className="absolute w-20 h-20 rounded-full border-4 border-white opacity-0 animate-long-press-ring"></div>
       </div>

       {/* Ghost */}
       <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-ghost-move opacity-0 z-0">
            <span className="material-symbols-outlined text-6xl text-blue-600/50 drop-shadow-xl" style={{ fontVariationSettings: "'FILL' 1" }}>accessibility_new</span>
       </div>

       {/* Dashed Line */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
           <line x1="33%" y1="50%" x2="66%" y2="50%" stroke="#2563eb" strokeWidth="3" strokeDasharray="6,6" className="opacity-0 animate-ghost-line" />
       </svg>
       
       <div className="absolute z-20 animate-cursor-long-press">
            <span className="material-symbols-outlined text-white drop-shadow-md text-3xl">touch_app</span>
       </div>

       <style>{`
            .animate-long-press-ring { animation: long-press-ring 4s infinite; }
            .animate-ghost-move { animation: ghost-move 4s infinite; }
            .animate-ghost-line { animation: ghost-line-appear 4s infinite; }
            .animate-cursor-long-press { animation: cursor-long-press 4s infinite; }

            @keyframes cursor-long-press {
                0% { top: 50%; left: 33%; transform: translate(0,0); }
                10% { transform: translate(0,0) scale(0.9); } /* Press */
                35% { transform: translate(0,0) scale(0.9); } /* Hold */
                60% { top: 50%; left: 66%; transform: translate(0,0) scale(0.9); } /* Drag */
                70% { top: 50%; left: 66%; transform: translate(0,0) scale(1); } /* Release */
                100% { top: 50%; left: 66%; }
            }
            @keyframes long-press-ring {
                0%, 10% { opacity: 0; transform: scale(0.5); }
                30% { opacity: 1; transform: scale(1.1); }
                31% { opacity: 0; }
                100% { opacity: 0; }
            }
            @keyframes ghost-move {
                0%, 35% { opacity: 0; left: 33%; }
                36% { opacity: 0.5; left: 33%; }
                60%, 100% { opacity: 0.5; left: 66%; }
            }
            @keyframes ghost-line-appear {
                0%, 35% { opacity: 0; x2: 33%; }
                36% { opacity: 1; }
                60%, 100% { opacity: 1; x2: 66%; }
            }
       `}</style>
    </div>
);

const VisualStep4 = () => (
    <div className="relative w-full h-full bg-[#1c2620] overflow-hidden border border-white/5 rounded-xl flex flex-col items-center justify-center gap-6">
        
        {/* Mock Lock Button */}
        <div className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 animate-lock-btn shadow-xl">
             <span className="material-symbols-outlined text-4xl animate-lock-icon transition-opacity">lock_open</span>
        </div>

        <div className="text-white/50 font-bold text-lg animate-lock-text tracking-widest">UNLOCKED</div>

        {/* Cursor */}
        <div className="absolute z-20 animate-cursor-lock">
             <span className="material-symbols-outlined text-white drop-shadow-md text-3xl">touch_app</span>
        </div>

         {/* Overlays for state change */}
         <div className="absolute top-[calc(50%-40px)] w-20 h-20 flex items-center justify-center animate-lock-overlay pointer-events-none">
             <span className="material-symbols-outlined text-4xl text-rose-500">lock</span>
         </div>
         <div className="absolute top-[calc(50%+48px)] w-full text-center font-bold text-lg text-rose-500 animate-lock-text-overlay tracking-widest pointer-events-none">LOCKED</div>

        <style>{`
            .animate-lock-btn { animation: lock-btn-state 4s infinite; }
            .animate-lock-icon { animation: lock-icon-hide 4s infinite; }
            .animate-lock-text { animation: lock-icon-hide 4s infinite; }
            .animate-cursor-lock { animation: cursor-lock-move 4s infinite; }
            .animate-lock-overlay { animation: lock-overlay-opacity 4s infinite; opacity: 0; }
            .animate-lock-text-overlay { animation: lock-overlay-opacity 4s infinite; opacity: 0; }

            @keyframes cursor-lock-move {
                0%, 15% { transform: translate(40px, 40px); opacity: 0; }
                20% { transform: translate(0, 0); opacity: 1; } /* Arrive */
                25% { transform: scale(0.9); } /* Click */
                30% { transform: scale(1); opacity: 0; } /* Leave */
                100% { opacity: 0; }
            }

            @keyframes lock-btn-state {
                0%, 25% { background-color: transparent; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.5); }
                26% { transform: scale(0.95); }
                30%, 80% { background-color: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.6); color: #f43f5e; transform: scale(1); }
                100% { background-color: transparent; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.5); }
            }

            @keyframes lock-overlay-opacity {
                 0%, 29% { opacity: 0; }
                 30%, 80% { opacity: 1; }
                 81%, 100% { opacity: 0; }
            }
            
            @keyframes lock-icon-hide {
                0%, 29% { opacity: 1; }
                30%, 80% { opacity: 0; }
                81%, 100% { opacity: 1; }
            }
        `}</style>
    </div>
);


export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Reset step when opened
  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('bsb_tutorial_seen', 'true');
    }
    onClose();
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
                {currentStep === 0 && <VisualStep0 />}
                {currentStep === 1 && <VisualStep1 />}
                {currentStep === 2 && <VisualStep2 />}
                {currentStep === 3 && <VisualStep3 />}
                {currentStep === 4 && <VisualStep4 />}
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
            
            {/* Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}`}>
                {dontShowAgain && <span className="material-symbols-outlined text-sidebar-dark text-sm font-bold">check</span>}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">Don't show this again</span>
            </label>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
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
                 {currentStep === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"}
                 {currentStep < TUTORIAL_STEPS.length - 1 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
               </button>
            </div>
        </div>

        {/* Absolute Close */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors z-50"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

      </div>
    </div>
  );
};
