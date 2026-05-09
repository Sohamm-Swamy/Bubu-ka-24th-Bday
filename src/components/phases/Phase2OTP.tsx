"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/lib/useGameState";
import { OTP_CODE, KISSES_REQUIRED } from "@/lib/constants";

interface Phase2OTPProps {
  onNext: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
}

export function Phase2OTP({ onNext, showDevMode, onSkipPhase }: Phase2OTPProps) {
  const { state, updateState } = useGameState();
  const [showModal, setShowModal] = useState(false);
  const [kissesDelivered, setKissesDelivered] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRevealOTP = () => {
    setShowModal(true);
  };

  const handleKissesDelivered = () => {
    setKissesDelivered(true);
    updateState({ otpRevealed: true });
    setTimeout(() => {
      setShowContinueButton(true);
    }, 1000);
  };

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-5xl mb-4"
        >
          🛺
        </motion.div>
        <h1 className="text-3xl font-extrabold text-primary mb-2">
          Bubu ka Rapido
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="card text-center space-y-6">
          <div className="text-5xl mb-4" role="img" aria-label="Lock icon">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Driver Verification Required
          </h2>
          <p className="text-text-secondary">
            Your Rapido Premium needs to verify your identity
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRevealOTP}
            className="btn-primary w-full text-xl py-4"
          >
            <span className="mr-2">💋</span>
            Reveal My OTP
          </motion.button>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-background rounded-t-3xl p-6 space-y-6"
            >
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />

              <div className="text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  OTP Verification
                </h3>

                <div className="my-6">
                  <motion.div
                    animate={{
                      filter: kissesDelivered ? "blur(0px)" : "blur(10px)",
                    }}
                    transition={{ duration: 0.8 }}
                    className="text-6xl font-mono font-bold text-primary"
                  >
                    {OTP_CODE}
                  </motion.div>
                </div>

                {!kissesDelivered && (
                  <p className="text-text-secondary mb-6">
                    To reveal your OTP, the passenger must deliver{" "}
                    {KISSES_REQUIRED} kisses to the driver in honor of her
                    24th birthday 🎂💋
                  </p>
                )}

                <AnimatePresence mode="wait">
                  {!kissesDelivered ? (
                    <motion.button
                      key="kisses"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleKissesDelivered}
                      className="btn-primary w-full text-xl py-4"
                    >
                      ✅ Kisses Delivered!
                    </motion.button>
                  ) : (
                    <motion.div
                      key="continue"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Confetti animation */}
                      <div className="flex justify-center gap-2 mb-4">
                        {[...Array(10)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{
                              y: -100,
                              opacity: 0,
                              rotate: Math.random() * 360,
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.1,
                              ease: "easeOut",
                            }}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: [
                                "#C9184A",
                                "#FF4D6D",
                                "#FFB800",
                                "#4CAF50",
                                "#FFCCD5",
                              ][i % 5],
                            }}
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="btn-primary w-full text-xl py-4"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Continuing...</span>
                          </div>
                        ) : (
                          "Continue to Your Adventure →"
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev mode indicator */}
      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/50">
          Phase 2
        </div>
      )}
    </div>
  );
}
