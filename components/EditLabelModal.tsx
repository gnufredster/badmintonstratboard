import React, { useState, useEffect } from 'react';

interface EditLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string) => void;
  initialLabel: string;
  title: string;
}

export const EditLabelModal: React.FC<EditLabelModalProps> = ({ isOpen, onClose, onSave, initialLabel, title }) => {
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-sidebar-dark border border-white/10 rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
            <input
                autoFocus
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-[#1c2620] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-white/20 mb-6 font-display"
                placeholder="Enter label..."
            />
            <div className="flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary text-sidebar-dark hover:bg-primary/90 transition-colors font-bold text-sm"
                >
                    Save
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};