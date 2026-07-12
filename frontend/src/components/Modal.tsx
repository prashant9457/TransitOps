import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div 
        className="bg-[#313338] w-full max-w-md rounded-xl shadow-2xl border border-[#1e1f22] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#1e1f22] flex justify-between items-center bg-[#2b2d31]">
          <h2 className="text-lg font-semibold text-[#f2f3f5]">{title}</h2>
          <button onClick={onClose} className="text-[#949ba4] hover:text-[#f23f42] transition-colors rounded-md hover:bg-[#1e1f22] p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
