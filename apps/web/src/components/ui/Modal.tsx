import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open:       boolean;
  onClose:    () => void;
  title:      string;
  children:   ReactNode;
  footer?:    ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 16  }}
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6">{children}</div>
            {footer && (
              <div className="px-6 pb-6 flex justify-end gap-3">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}