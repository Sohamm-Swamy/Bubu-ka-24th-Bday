"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { OTP_CODE, KISSES_REQUIRED } from "@/lib/constants";
import { Header } from "@/components/shared/Header";

interface Phase2OTPProps {
  onNext: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
  forceRemount?: () => void;
}

export function Phase2OTP({ onNext, showDevMode, onSkipPhase, forceRemount }: Phase2OTPProps) {
  const { state, updateState } = useGameState();
  const [showModal, setShowModal] = useState(false);

  console.log("Phase2OTP rendering, currentPhase:", state.currentPhase);
  const [kissesDelivered, setKissesDelivered] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const handleReveal = () => setShowModal(true);

  const handleKissesDelivered = () => {
    setKissesDelivered(true);
    updateState({ otpRevealed: true });
    setTimeout(() => setShowContinue(true), 800);
  };

  const handleContinue = () => {
    // Direct localStorage update
    try {
      const stored = localStorage.getItem('bubu_rapido_state');
      if (stored) {
        const state = JSON.parse(stored);
        state.currentPhase = 3;
        localStorage.setItem('bubu_rapido_state', JSON.stringify(state));
      }
    } catch (err) {
      console.error("Failed to update localStorage", err);
    }
    // Force reload to complete navigation
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6">
      <Header showThemeToggle={false} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center space-y-6 py-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Lock className="w-10 h-10 text-primary" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Driver Verification
            </h2>
            <p className="text-text-secondary">
              Your personal driver needs to verify it's really you
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReveal}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Reveal OTP
          </motion.button>
        </motion.div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={(e) => e.target === e.currentTarget && !kissesDelivered && setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-surface rounded-t-3xl p-6"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />

              <div className="text-center space-y-6">
                <h3 className="text-xl font-bold text-text-primary">
                  Verification Code
                </h3>

                <motion.div
                  animate={{
                    filter: kissesDelivered ? "blur(0px)" : "blur(12px)",
                  }}
                  transition={{ duration: 0.6 }}
                  className="text-7xl font-mono font-bold text-primary tracking-widest"
                >
                  {OTP_CODE}
                </motion.div>

                {!kissesDelivered ? (
                  <div className="space-y-4">
                    <p className="text-text-secondary text-sm">
                      For your 24th birthday, deliver {KISSES_REQUIRED} kisses to reveal your code
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleKissesDelivered}
                      className="btn-primary w-full text-lg py-4"
                    >
                      Kisses Delivered
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                        >
                          <Heart className="w-8 h-8 text-primary fill-primary" />
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-primary font-semibold">
                      Code revealed! Let's go on your adventure
                    </p>

                    <button
                      type="button"
                      onClick={handleContinue}
                      className="btn-primary w-full text-lg py-4"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/40">
          Phase 2
        </div>
      )}
    </div>
  );
}