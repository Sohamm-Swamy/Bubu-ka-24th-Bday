"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/lib/useGameState";
import { StarRating } from "@/components/ui/StarRating";

interface Phase5OutroProps {
  showDevMode?: boolean;
}

export function Phase5Outro({ showDevMode }: Phase5OutroProps) {
  const { state, updateState } = useGameState();
  const [subScreen, setSubScreen] = useState<1 | 2 | 3>(1);
  const [momentText, setMomentText] = useState(state.memorableMoment);
  const [finalRating, setFinalRating] = useState<number | null>(state.finalRating);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveMemory = () => {
    if (momentText.trim()) {
      updateState({ memorableMoment: momentText.trim() });
      setIsLoading(true);
      setTimeout(() => {
        setSubScreen(2);
        setIsLoading(false);
      }, 300);
    }
  };

  const handleFinalRating = (rating: number) => {
    setFinalRating(rating);
  };

  const handleSubmitRating = () => {
    if (finalRating) {
      updateState({ finalRating });
      setIsLoading(true);
      setTimeout(() => {
        setSubScreen(3);
        setIsLoading(false);
      }, 300);
    }
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
        <AnimatePresence mode="wait">
          {/* Sub-Screen 1: Memorable Moment */}
          {subScreen === 1 && (
            <motion.div
              key="subscreen-1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4" role="img" aria-label="Sparkles">
                  ✨
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Before we wrap up... 💭
                </h2>
                <p className="text-text-secondary">
                  Note down the most memorable part of today's adventure, Bubu.
                </p>
              </div>

              <textarea
                value={momentText}
                onChange={(e) => setMomentText(e.target.value)}
                placeholder="Tell me everything... 💕"
                rows={5}
                className="input-field resize-none"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveMemory}
                disabled={!momentText.trim() || isLoading}
                className="btn-primary w-full text-xl py-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save This Memory 📝"
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Sub-Screen 2: Final Rating */}
          {subScreen === 2 && (
            <motion.div
              key="subscreen-2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  One last thing... ⭐
                </h2>
                <p className="text-text-secondary">
                  Were you satisfied with the services provided by your Rapido
                  Premium today?
                </p>
              </div>

              <div className="card text-center space-y-4">
                <StarRating
                  value={finalRating}
                  onChange={handleFinalRating}
                  size="lg"
                />

                {finalRating === 5 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-semibold"
                  >
                    💕 You're too kind, Bubu!
                  </motion.p>
                )}

                {(finalRating === 1 || finalRating === 2) && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-text-secondary"
                  >
                    😢 We'll do better next time, Bubu!
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitRating}
                disabled={!finalRating || isLoading}
                className="btn-primary w-full text-xl py-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Final Rating 💌"
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Sub-Screen 3: Final Message */}
          {subScreen === 3 && (
            <motion.div
              key="subscreen-3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8 py-12"
            >
              {/* Animated Heart */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-8xl"
                role="img"
                aria-label="Heart"
              >
                ❤️
              </motion.div>

              {/* Floating Hearts Animation */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: "100vh", opacity: 0 }}
                    animate={{ y: "-100px", opacity: [0, 1, 0] }}
                    transition={{
                      duration: 4 + Math.random() * 4,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute text-4xl"
                    style={{ left: `${10 + Math.random() * 80}%` }}
                  >
                    ❤️
                  </motion.div>
                ))}
              </div>

              {/* Final Message */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-2xl font-bold text-primary">
                    Thank you for riding with your personal
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    Premium Rapido forever. 🛺💕
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <p className="text-text-secondary text-lg">
                    We hope to see you again,
                  </p>
                  <p className="text-text-secondary text-lg">
                    and again, and again...
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-3xl font-extrabold text-primary">
                    Happy 24th Birthday, Bubu. 🎂✨
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-text-secondary mt-12"
              >
                Made with 💕 just for you
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dev mode indicator */}
      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/50">
          Phase 5 - Sub-screen {subScreen}
        </div>
      )}
    </div>
  );
}
