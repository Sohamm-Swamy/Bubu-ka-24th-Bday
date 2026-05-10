"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { RAPIDO_PHONE_NUMBER } from "@/lib/constants";
import { Header } from "@/components/shared/Header";

interface Phase1BookingProps {
  onNext?: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
  forceRemount?: () => void;
}

export function Phase1Booking({ showDevMode, forceRemount }: Phase1BookingProps) {
  const { state, updateState } = useGameState();
  const [step, setStep] = useState<"initial" | "intro" | "call" | "continue">("initial");
  const [showFallback, setShowFallback] = useState(false);
  const [, forceUpdate] = useState(0);

  const logoTapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.callInitiated) {
      setStep("continue");
    }
  }, [state.callInitiated]);

  // Show fallback button after 5 seconds in call step
  useEffect(() => {
    if (step === "call") {
      const timer = setTimeout(() => setShowFallback(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
    }
  }, [step]);

  const handleBook = () => {
    setStep("intro");
    setTimeout(() => {
      setStep("call");
    }, 5000);
  };

  const handleCallClick = () => {
    updateState({ callInitiated: true });
    setStep("continue");
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct localStorage update - guaranteed to work
    try {
      const stored = localStorage.getItem('bubu_rapido_state');
      if (stored) {
        const state = JSON.parse(stored);
        state.currentPhase = 2;
        localStorage.setItem('bubu_rapido_state', JSON.stringify(state));
        console.log("localStorage updated to phase 2");
      }
    } catch (err) {
      console.error("Failed to update localStorage", err);
    }
    // Force reload to complete navigation
    setTimeout(() => window.location.reload(), 50);
  };

  const handleFallback = () => {
    updateState({ callInitiated: true });
    setStep("continue");
  };

  const handleLogoTap = () => {
    if (!showDevMode) return;
    logoTapCount.current++;
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => { logoTapCount.current = 0; }, 500);
    if (logoTapCount.current === 5) {
      handleContinue({ preventDefault: () => { }, stopPropagation: () => { } } as any);
      logoTapCount.current = 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6">
      <Header onLogoTap={handleLogoTap} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === "initial" && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="card py-10 space-y-4"
              >
                <p className="text-text-secondary text-lg">
                  Your personal ride awaits
                </p>
                <h2 className="text-3xl font-bold text-primary">
                  Ready for your birthday adventure?
                </h2>
              </motion.div>

              {/* Dudubiker GIF */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <img
                  src="/dudubiker.gif"
                  alt="Dudu on Bike"
                  className="w-48 h-auto rounded-xl"
                />
              </motion.div>

              <button
                type="button"
                onClick={handleBook}
                className="btn-primary w-full text-xl py-4"
              >
                Book Your Rapido!
              </button>
            </motion.div>
          )}

          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary mb-8"
              >
                Why book one when you have your own?
              </motion.p>

              <div className="card text-center py-8">
                <p className="text-text-secondary font-bold">
                  Your Rapido Premium Dudu is just a call away
                </p>
              </div>
            </motion.div>
          )}

          {step === "call" && (
            <motion.div
              key="call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="card space-y-6">
                <a
                  href={`tel:${RAPIDO_PHONE_NUMBER}`}
                  onClick={handleCallClick}
                  className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  Call Your Ride
                </a>

                {showFallback && (
                  <button
                    onClick={handleFallback}
                    className="w-full text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    Can't call? Continue anyway
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === "continue" && (
            <motion.div
              key="continue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-8"
              >
                <span className="text-6xl">✓</span>
              </motion.div>

              <h2 className="text-2xl font-bold text-primary mb-4">
                Your ride is on the way!
              </h2>
              <p className="text-text-secondary mb-8">
                Let's begin your adventure
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="btn-primary w-full text-lg py-4 relative z-50"
              >
                Start Adventure
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/40">
          Phase 1 | State: {state.currentPhase}
        </div>
      )}
    </div>
  );
}