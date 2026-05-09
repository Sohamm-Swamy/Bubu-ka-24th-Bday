"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameState } from "@/lib/useGameState";
import { Phase1Booking } from "@/components/phases/Phase1Booking";
import { Phase2OTP } from "@/components/phases/Phase2OTP";
import { Phase3Clue } from "@/components/phases/Phase3Clue";
import { Phase4Reward } from "@/components/phases/Phase4Reward";
import { Phase5Outro } from "@/components/phases/Phase5Outro";

export function BubuApp() {
  const { state, isLocalStorageAvailable, resetState } = useGameState();
  const [showDevMode, setShowDevMode] = useState(false);

  const handleNextPhase = () => {
    // Phase transitions are handled in the useGameState hook
    // Each phase component calls onNext which triggers the transition
  };

  const handleSkipPhase = () => {
    // Skip to next phase for dev mode
    switch (state.currentPhase) {
      case 1:
        // Skip to phase 2
        break;
      case 2:
        // Skip to phase 3
        break;
      case 3:
        // Skip to phase 4
        break;
      case 4:
        // Skip to phase 5
        break;
    }
  };

  const handleResetAll = () => {
    resetState();
  };

  return (
    <div className="min-h-screen relative">
      {/* Private browsing warning */}
      {!isLocalStorageAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b-2 border-yellow-300 text-yellow-800 text-center py-2 px-4 z-50 text-sm">
          Please disable private browsing for the best experience 💕
        </div>
      )}

      {/* Dev Mode Panel */}
      {showDevMode && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-muted max-w-xs space-y-3">
            <h3 className="font-bold text-text-primary text-sm">
              🔧 Dev Mode
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <p>Current Phase: {state.currentPhase}</p>
              <p>Location Index: {state.currentLocationIndex}</p>
              <p>Points: {state.bubuPoints}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleResetAll}
                className="w-full btn-secondary py-2 text-sm"
              >
                Reset All State
              </button>
              <button
                onClick={() => setShowDevMode(false)}
                className="w-full btn-primary py-2 text-sm"
              >
                Close Dev Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Routing */}
      <AnimatePresence mode="wait">
        {state.currentPhase === 1 && (
          <motion.div
            key="phase-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Phase1Booking
              onNext={() => {}}
              showDevMode={showDevMode}
              onSkipPhase={handleSkipPhase}
            />
          </motion.div>
        )}

        {state.currentPhase === 2 && (
          <motion.div
            key="phase-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Phase2OTP
              onNext={() => {}}
              showDevMode={showDevMode}
              onSkipPhase={handleSkipPhase}
            />
          </motion.div>
        )}

        {state.currentPhase === 3 && (
          <motion.div
            key="phase-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Phase3Clue
              onPhaseComplete={() => {}}
              showDevMode={showDevMode}
              onSkipPhase={handleSkipPhase}
            />
          </motion.div>
        )}

        {state.currentPhase === 4 && (
          <motion.div
            key="phase-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Phase4Reward
              onNext={() => {}}
              showDevMode={showDevMode}
              onSkipPhase={handleSkipPhase}
            />
          </motion.div>
        )}

        {state.currentPhase === 5 && (
          <motion.div
            key="phase-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Phase5Outro showDevMode={showDevMode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden dev mode toggle - tap footer 5 times */}
      <button
        onClick={() => {
          const footer = document.querySelector('[data-dev-toggle="true"]');
          const tapCount = parseInt(footer?.getAttribute('data-tap-count') || '0');
          const newCount = tapCount + 1;
          footer?.setAttribute('data-tap-count', newCount.toString());
          
          if (newCount >= 5) {
            setShowDevMode(!showDevMode);
            footer?.setAttribute('data-tap-count', '0');
          }
          
          setTimeout(() => {
            if (newCount < 5) {
              footer?.setAttribute('data-tap-count', '0');
            }
          }, 2000);
        }}
        className="fixed bottom-0 left-0 right-0 h-8 z-40"
        aria-label="Dev mode toggle"
        data-dev-toggle="true"
        data-tap-count="0"
      />
    </div>
  );
}
