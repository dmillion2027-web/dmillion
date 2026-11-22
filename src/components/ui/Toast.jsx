import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-center space-x-3 px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm border ${
                t.type === 'success'
                  ? 'bg-white border-[#e8d5b7] text-black'
                  : t.type === 'error'
                  ? 'bg-white border-red-300 text-black'
                  : 'bg-white border-blue-200 text-black'
              }`}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}
              </motion.div>

              {/* Message */}
              <p className="text-sm font-medium flex-1">{t.message}</p>

              {/* Close */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left rounded-b-xl ${
                  t.type === 'success' ? 'bg-[#e8d5b7]' : t.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
