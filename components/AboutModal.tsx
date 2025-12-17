
import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-sidebar-dark border border-white/10 rounded-2xl shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
              <span className="material-symbols-outlined text-3xl">sports_tennis</span>
            </div>
            
            <h2 className="text-xl font-display font-bold text-white mb-2">About StratBoard</h2>
            
            <div className="space-y-4 text-white/70 text-sm leading-relaxed mb-6 font-body">
                <p>
                    Hi, I'm Frederick.
                </p>
                <p>
                    As a passionate badminton enthusiast, I often found it difficult to coach players on court simply by finger pointing and waving hands. Visualizing strategy is key.
                </p>
                <p>
                    I designed StratBoard with ease of use in mind—to help coaches and players communicate tactics effectively without the hassle.
                </p>
            </div>

            <div className="w-full p-4 bg-[#1c2620] rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest mb-1">Feedback & Contact</p>
                <a href="mailto:fredericktang.stratboard@gmail.com" className="text-primary hover:underline text-sm break-all">
                    fredericktang.stratboard@gmail.com
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};
