"use client";

import React, { useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Focus input' },
    { keys: ['⌘', '/'], description: 'Toggle sidebar' },
    { keys: ['Esc'], description: 'Clear input / Close dialogs' },
    { keys: ['⌘', '⇧', '?'], description: 'Show keyboard shortcuts' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 id="shortcuts-title" className="text-xl font-bold text-[#e0e0e0] flex items-center gap-2">
                  <Command className="w-5 h-5" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#3a3a3a] transition-colors focus-visible:outline-2 focus-visible:outline-[#6C739C] focus-visible:outline-offset-2"
                  aria-label="Close shortcuts"
                >
                  <X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>
              <div className="space-y-3">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[#3a3a3a] last:border-0">
                    <span className="text-[#888888]">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2 py-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-xs text-[#e0e0e0] font-mono">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-[#888888] mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

