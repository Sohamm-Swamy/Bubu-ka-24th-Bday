"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { RAPIDO_PHONE_NUMBER } from "@/lib/constants";

interface Phase1BookingProps {
  onNext: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
}

export function Phase1Booking({ onNext, showDevMode, onSkipPhase }: Phase1BookingProps) {
  const { state, updateState } = useGameState();
  const [showRapidoText, setShowRapidoText] = useState(false);
  const [showCallButton, setShowCallButton] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showFallbackLink, setShowFallbackLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoTapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check if user returned from phone call
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        state.callInitiated &&
        !showContinueButton
      ) {
        setShowContinueButton(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If call was already initiated (page refresh case)
    if (state.callInitiated) {
      setShowContinueButton(true);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.callInitiated, showContinueButton]);

  const handleBookClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowRapidoText(true);
      setTimeout(() => {
        setShowCallButton(true);
        setIsLoading(false);
        // Show fallback link after 10 seconds
        setTimeout(() => {
          if (!showContinueButton) {
            setShowFallbackLink(true);
          }
        }, 10000);
      }, 1500);
    }, 300);
  };

  const handleCallClick = () => {
    updateState({ callInitiated: true });
  };

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const handleFallbackContinue = () => {
    updateState({ callInitiated: true });
    setShowContinueButton(true);
  };

  const handleLogoTap = () => {
    if (!showDevMode) return;

    logoTapCount.current++;
    
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    tapTimeout.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 500);

    if (logoTapCount.current === 5) {
      onSkipPhase?.();
      logoTapCount.current = 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header */}
      <div
        onClick={handleLogoTap}
        className="text-center mb-8 cursor-pointer"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl mb-4"
        >
          🛺
        </motion.div>
        <h1 className="text-4xl font-extrabold text-primary mb-2">
          Bubu ka Rapido
        </h1>
        <p className="text-text-secondary text-lg">
          Your personal premium ride, always on time 💕
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
        <AnimatePresence mode="wait">
          {/* Initial book button */}
          {!showRapidoText && (
            <motion.button
              key="book"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={handleBookClick}
              className="btn-primary w-full text-xl py-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Booking...</span>
                </div>
              ) : (
                "Book Your Rapido 🛺"
              )}
            </motion.button>
          )}

          {/* Rapido text */}
          {showRapidoText && !showContinueButton && (
            <motion.div
              key="rapido-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-primary mb-6"
              >
                Why book one when you have your own Rapido Premium? 😏
              </motion.p>

              {showCallButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-4"
                >
                  <a
                    href={`tel:${RAPIDO_PHONE_NUMBER}`}
                    onClick={handleCallClick}
                    className="btn-primary w-full text-xl py-4 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-6 h-6" />
                    <span>Call Your Rapido Premium</span>
                  </a>

                  {showFallbackLink && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleFallbackContinue}
                      className="text-sm text-text-secondary hover:text-primary underline"
                    >
                      Didn't work? Tap here to continue anyway →
                    </motion.button>
                  )}

                  {showContinueButton && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        "Continue →"
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dev mode indicator */}
      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/50">
          Phase 1
        </div>
      )}
    </div>
  );
}
