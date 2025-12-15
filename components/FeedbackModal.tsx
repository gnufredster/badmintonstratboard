import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState<'suggestion' | 'bug'>('suggestion');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API submission
    console.log('Feedback submitted:', { type, feedback });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-sidebar-dark border border-white/10 rounded-2xl shadow-2xl transform transition-all scale-100 p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {!submitted ? (
          <>
            <h3 className="text-xl font-bold text-white mb-1">Send Feedback</h3>
            <p className="text-white/50 text-sm mb-6">Help us improve the strategy builder.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    type === 'suggestion' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-[#1c2620] border-transparent text-white/50 hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                  <span className="text-sm font-medium">Suggestion</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    type === 'bug' 
                      ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
                      : 'bg-[#1c2620] border-transparent text-white/50 hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">bug_report</span>
                  <span className="text-sm font-medium">Bug Report</span>
                </button>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest">Your Message</label>
                 <textarea
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think..."
                    className="w-full h-32 bg-[#1c2620] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 resize-none placeholder-white/20"
                 ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-white text-sidebar-dark px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
            <p className="text-white/50">Your feedback has been recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};