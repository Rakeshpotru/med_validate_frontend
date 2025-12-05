import React, { JSX, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg"
        style={{ backgroundColor: '#78A83A' }}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
        <p className="text-sm font-medium text-white">{message}</p>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

type UseToastReturn = {
  showToast: (message: string, duration?: number) => void;
  Toast: () => JSX.Element | null;
};

export function useToast(): UseToastReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = (message: string, duration = 3000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setIsOpen(true);
  };

  return {
    showToast,
    Toast: () =>
      isOpen ? (
        <Toast
          message={toastMessage}
          onClose={() => setIsOpen(false)}
          duration={toastDuration}
        />
      ) : null,
  };
}
