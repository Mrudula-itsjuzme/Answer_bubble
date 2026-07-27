import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  Pin,
  X,
  Volume2,
  BrainCircuit,
  Maximize2,
  Minimize2,
  Zap,
  Keyboard,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { GhostTypingRelay } from '@answer-bubble/shared';

export const FloatingBubbleOverlay: React.FC = () => {
  const {
    isOverlayCollapsed,
    setIsOverlayCollapsed,
    currentSuggestions,
    audioLevel,
    isSpeaking,
    isCapturing,
    activeMeeting,
    dismissSuggestion,
  } = useAppStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [isPopping, setIsPopping] = useState<boolean>(false);

  const activeSuggestion = currentSuggestions[0];

  // Trigger translucent pop animation whenever a new suggestion arrives
  useEffect(() => {
    if (activeSuggestion) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [activeSuggestion?.id]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePin = (id: string) => {
    setPinnedId(pinnedId === id ? null : id);
  };

  if (!isCapturing && !activeSuggestion) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{
          opacity: 1,
          scale: isPopping ? [0.95, 1.06, 1] : 1,
          y: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        className={`glass-bubble rounded-2xl p-4 shadow-2xl max-w-sm w-[370px] text-slate-100 border transition-all duration-300 ${
          isPopping
            ? 'border-indigo-400/80 shadow-[0_0_40px_rgba(99,102,241,0.5)] bg-slate-950/90'
            : 'border-indigo-500/30 backdrop-blur-xl bg-slate-950/85 shadow-2xl'
        }`}
      >
        {/* Answer Ready Translucent Pop Badge */}
        <AnimatePresence>
          {isPopping && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-bold tracking-wider px-3 py-0.5 rounded-full shadow-lg flex items-center space-x-1"
            >
              <Zap className="w-3 h-3 text-amber-300 animate-bounce" />
              <span>ANSWER POPPED!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 cursor-grab active:cursor-grabbing">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="w-4 h-4 text-white animate-pulse" />
              </div>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                {activeMeeting?.meetingType || 'Copilot Active'}
              </span>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>{isCapturing ? 'Listening System Audio' : 'Standby'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsOverlayCollapsed(!isOverlayCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title={isOverlayCollapsed ? 'Expand Bubble' : 'Collapse Bubble'}
            >
              {isOverlayCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsed State Minimal Indicator */}
        {isOverlayCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between py-1.5 px-2.5 bg-indigo-950/50 rounded-xl border border-indigo-500/30 text-xs text-indigo-200"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="truncate max-w-[200px] font-medium">
                {activeSuggestion ? activeSuggestion.text : 'Listening for questions...'}
              </span>
            </div>
            {activeSuggestion && (
              <span className="bg-indigo-600/70 text-white text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                {activeSuggestion.wordCount}w
              </span>
            )}
          </motion.div>
        ) : (
          /* Expanded Suggestion Container */
          <AnimatePresence mode="wait">
            {activeSuggestion ? (
              <motion.div
                key={activeSuggestion.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="space-y-3"
              >
                {/* Question Trigger Badge */}
                {activeSuggestion.triggeredByQuestion && (
                  <div className="text-[11px] text-indigo-300/90 bg-indigo-950/60 p-2 rounded-xl border border-indigo-500/30 italic truncate">
                    "{activeSuggestion.triggeredByQuestion}"
                  </div>
                )}

                {/* Translucent Ultra-Concise AI Suggestion Box */}
                <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/70 to-slate-950/70 p-3.5 rounded-xl border border-indigo-400/40 text-sm font-semibold text-slate-100 leading-relaxed shadow-inner">
                  {activeSuggestion.text}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold">
                      {activeSuggestion.wordCount} words
                    </span>
                    <span>{activeSuggestion.timestamp}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={async () => {
                        await GhostTypingRelay.typeIntoFocusedWindow(activeSuggestion.text);
                        setCopiedId(activeSuggestion.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/50 hover:bg-emerald-600/80 text-emerald-100 transition-colors shadow-md"
                      title="Ghost Type into active input window"
                    >
                      <Keyboard className="w-3 h-3" />
                      <span>{copiedId === activeSuggestion.id ? 'Typed!' : 'Ghost Type'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(activeSuggestion.text, activeSuggestion.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/50 hover:bg-indigo-600/80 text-indigo-100 transition-colors shadow-md"
                      title="Copy answer"
                    >
                      {copiedId === activeSuggestion.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => togglePin(activeSuggestion.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        pinnedId === activeSuggestion.id
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'hover:bg-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Pin answer"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => dismissSuggestion(activeSuggestion.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <p>Copilot active. Translucent pop overlay listening for questions...</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};
