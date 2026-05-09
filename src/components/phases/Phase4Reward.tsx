"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/lib/useGameState";
import { BONUS_SERVICES } from "@/lib/constants";
import { Trophy } from "lucide-react";
import { PointsBadge } from "@/components/ui/PointsBadge";

interface Phase4RewardProps {
  onNext: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
}

export function Phase4Reward({ onNext, showDevMode, onSkipPhase }: Phase4RewardProps) {
  const { state, updateState } = useGameState();
  const [confettiActive, setConfettiActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setConfettiActive(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleBonusService = (index: number) => {
    const selected = state.selectedBonusServices;
    const isSelected = selected.includes(index);

    if (isSelected) {
      updateState({
        selectedBonusServices: selected.filter((i) => i !== index),
      });
    } else if (selected.length < 3) {
      updateState({
        selectedBonusServices: [...selected, index].sort((a, b) => a - b),
      });
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const canSubmit = state.selectedBonusServices.length === 3;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Points Badge */}
      <PointsBadge points={state.bubuPoints} />

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="text-6xl mb-4"
          role="img"
          aria-label="Trophy"
        >
          🏆
        </motion.div>
        <h1 className="text-3xl font-extrabold text-primary mb-2">
          Bubu ka Rapido
        </h1>
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {confettiActive && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {[...Array(30)].map((_, i) => {
              const colors = ["#C9184A", "#FF4D6D", "#FFB800", "#4CAF50", "#FFCCD5"];
              const color = colors[i % colors.length];
              const left = Math.random() * 100;
              const delay = Math.random() * 0.5;
              const duration = 2 + Math.random() * 2;

              return (
                <motion.div
                  key={i}
                  initial={{ y: -100, opacity: 1, rotate: 0 }}
                  animate={{ y: "100vh", opacity: 0, rotate: 720 }}
                  transition={{
                    duration,
                    delay,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{ left: `${left}%`, backgroundColor: color }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6 relative z-10">
        <div className="card text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            🎊 Congratulations, Bubu!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary"
          >
            You've collected 300 Bubu Points on your 24th birthday adventure!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-2 my-6"
          >
            <Trophy className="w-8 h-8 text-gold" />
            <span className="text-3xl font-bold text-gold">
              ⭐ 300 Bubu Points
            </span>
          </motion.div>
        </div>

        {/* Bonus Services Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-text-primary text-center">
            Choose 3 bonus services your Rapido Premium will perform 💕
          </h3>
          <p className="text-sm text-text-secondary text-center">
            (Select exactly 3)
          </p>

          <div className="space-y-3">
            {BONUS_SERVICES.map((service, index) => {
              const isSelected = state.selectedBonusServices.includes(index);
              const isMaxReached = state.selectedBonusServices.length >= 3 && !isSelected;

              return (
                <motion.button
                  key={index}
                  whileHover={!isMaxReached ? { scale: 1.02 } : {}}
                  whileTap={!isMaxReached ? { scale: 0.98 } : {}}
                  onClick={() => !isMaxReached && toggleBonusService(index)}
                  disabled={isMaxReached}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : isMaxReached
                      ? "border-muted bg-muted/20 opacity-60"
                      : "border-muted bg-white hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {isSelected ? "❤️" : "🤍"}
                    </span>
                    <p
                      className={`text-sm ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-text-primary"
                      }`}
                    >
                      {service}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selection Counter */}
          <motion.div
            className={`text-center py-2 px-4 rounded-full ${
              state.selectedBonusServices.length === 3
                ? "bg-success/20 text-success"
                : "bg-muted/30 text-text-secondary"
            }`}
          >
            <span className="font-bold">
              {state.selectedBonusServices.length} / 3 selected
            </span>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className={`w-full text-xl py-4 rounded-full font-bold shadow-lg transition-all ${
              canSubmit
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-muted text-text-secondary opacity-50 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                <span>Submitting...</span>
              </div>
            ) : (
              "I've told my Rapido Premium my choices 💌"
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Dev mode indicator */}
      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/50">
          Phase 4
        </div>
      )}
    </div>
  );
}
