"use client";

import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/lib/useGameState";
import { Phase1Booking } from "@/components/phases/Phase1Booking";
import { Phase2OTP } from "@/components/phases/Phase2OTP";
import { Phase3Clue } from "@/components/phases/Phase3Clue";
import { Phase4Reward } from "@/components/phases/Phase4Reward";
import { Phase5Outro } from "@/components/phases/Phase5Outro";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DEV_MODE_ENABLED } from "@/lib/constants";

export function BubuApp() {
  const { state, isLocalStorageAvailable, resetState, updateState } = useGameState();
  const [showDevMode, setShowDevMode] = useState(false);
  const [showFullState, setShowFullState] = useState(false);
  const [remountKey, setRemountKey] = useState(0);

  // Direct function to force remount - call this after phase change
  const forceRemount = () => {
    setRemountKey(k => k + 1);
  };

  const handleNextPhase = () => {
    // Phase transitions are handled in the useGameState hook
    // Each phase component calls onNext which triggers the transition
  };

  // Only show dev mode UI if both the toggle was activated AND DEV_MODE_ENABLED is true
  const actualDevMode = showDevMode && DEV_MODE_ENABLED;

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

  const handleJumpToPhase = (phase: number) => {
    updateState({ currentPhase: phase as 1|2|3|4|5 });
  };

  const handleJumpToLocation = (index: number) => {
    updateState({
      currentLocationIndex: index,
      timerExpired: false,
      mapVisible: false,
      userArrived: false,
      answerSubmitted: false,
    });
  };

  const handleSimulateArrival = () => {
    // Call the Phase3 function if it exists
    if (typeof (window as any).devSimulateArrival === 'function') {
      (window as any).devSimulateArrival();
    } else {
      // Fallback for old logic
      updateState({ userArrived: true });
    }
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
      {showDevMode && DEV_MODE_ENABLED && (
        <div className="fixed bottom-4 left-4 z-50 max-h-[80vh] overflow-y-auto">
          <div className="bg-surface rounded-xl shadow-2xl p-4 border-2 border-muted max-w-xs space-y-3">
            <h3 className="font-bold text-text-primary text-sm">
              Dev Mode
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <p>Phase: {state.currentPhase} | Location: {state.currentLocationIndex + 1}/3 | Points: {state.bubuPoints}</p>
            </div>

            {/* Phase Jump */}
            <div className="space-y-1">
              <label className="text-xs font-semibold">Jump to Phase:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleJumpToPhase(p)}
                    className={`px-2 py-1 text-xs rounded ${
                      state.currentPhase === p
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Jump (only in Phase 3) */}
            {state.currentPhase === 3 && (
              <div className="space-y-1">
                <label className="text-xs font-semibold">Jump to Location:</label>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => handleJumpToLocation(i)}
                      className={`px-2 py-1 text-xs rounded ${
                        state.currentLocationIndex === i
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSimulateArrival}
                  className="w-full btn-secondary py-1 text-xs"
                >
                  Simulate Arrival
                </button>
              </div>
            )}

            {/* Phase 3 Dev Controls - Bypass GPS */}
            {state.currentPhase === 3 && (
              <div className="space-y-1 pt-2 border-t">
                <label className="text-xs font-semibold">Phase 3 Bypass:</label>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => {
                      // Call the phase 3 function via window if available
                      (window as any).devEnableComplete?.();
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Enable Button
                  </button>
                  <button
                    onClick={() => {
                      (window as any).devSkipToPhoto?.();
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Skip to Photo
                  </button>
                  <button
                    onClick={() => {
                      (window as any).devOpenCamera?.();
                    }}
                    className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Open Camera
                  </button>
                </div>
              </div>
            )}

            {/* View Full State Toggle */}
            <button
              onClick={() => setShowFullState(!showFullState)}
              className="w-full text-xs text-text-secondary underline"
            >
              {showFullState ? "Hide" : "View"} Full State
            </button>
            {showFullState && (
              <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                {JSON.stringify(state, null, 2)}
              </pre>
            )}

            <div className="space-y-2 pt-2 border-t">
              <button
                onClick={handleResetAll}
                className="w-full btn-secondary py-2 text-sm"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowDevMode(false)}
                className="w-full btn-primary py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Routing - Only ONE phase at a time with key-based remounting */}
      {(() => {
        switch (state.currentPhase) {
          case 1:
            return (
              <Phase1Booking
                key={remountKey}
                onNext={() => {}}
                showDevMode={actualDevMode}
                onSkipPhase={handleSkipPhase}
                forceRemount={forceRemount}
              />
            );
          case 2:
            return (
              <Phase2OTP
                key={remountKey}
                onNext={() => {}}
                showDevMode={actualDevMode}
                onSkipPhase={handleSkipPhase}
                forceRemount={forceRemount}
              />
            );
          case 3:
            return (
              <Phase3Clue
                key={remountKey}
                onPhaseComplete={() => {
                  updateState({ currentPhase: 4 });
                  forceRemount();
                }}
                showDevMode={actualDevMode}
                onSkipPhase={handleSkipPhase}
                forceRemount={forceRemount}
              />
            );
          case 4:
            return (
              <Phase4Reward
                key={remountKey}
                onNext={() => {}}
                showDevMode={actualDevMode}
                onSkipPhase={handleSkipPhase}
                forceRemount={forceRemount}
              />
            );
          case 5:
            return <Phase5Outro key={remountKey} showDevMode={actualDevMode} forceRemount={forceRemount} />;
          default:
            return <Phase1Booking key={remountKey} showDevMode={actualDevMode} forceRemount={forceRemount} />;
        }
      })()}

      {/* Fixed theme toggle - bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hidden dev mode toggle - tap footer 5 times (only works if DEV_MODE_ENABLED is true) */}
      {DEV_MODE_ENABLED && (
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
      )}
    </div>
  );
}
