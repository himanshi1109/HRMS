import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg, xl
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-charcoal-sidebar border border-indigo-border rounded-xl shadow-2xl overflow-hidden z-10 transform scale-95 opacity-0 animate-[modalShow_0.25s_ease-out_forwards]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-border bg-charcoal-navbar/50">
          <h3 className="text-lg font-semibold text-stardust-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-grey-text hover:text-stardust-text hover:bg-indigo-muted/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-stardust-text/90">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-indigo-border bg-charcoal-navbar/30">
            {footer}
          </div>
        )}
      </div>
      
      {/* Inline styles for modal animation */}
      <style>{`
        @keyframes modalShow {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
