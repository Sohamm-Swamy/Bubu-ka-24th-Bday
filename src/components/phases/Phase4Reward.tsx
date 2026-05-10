"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { BONUS_SERVICES, YOUR_EMAIL } from "@/lib/constants";
import { PointsBadge } from "@/components/ui/PointsBadge";
import { Header } from "@/components/shared/Header";

interface Phase4RewardProps {
  onNext: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
  forceRemount?: () => void;
}

export function Phase4Reward({ onNext, showDevMode, onSkipPhase, forceRemount }: Phase4RewardProps) {
  const { state, updateState } = useGameState();
  const [confettiActive, setConfettiActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setConfettiActive(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleBonus = (index: number) => {
    const selected = state.selectedBonusServices;
    if (selected.includes(index)) {
      updateState({ selectedBonusServices: selected.filter(i => i !== index) });
    } else if (selected.length < 3) {
      updateState({ selectedBonusServices: [...selected, index].sort((a, b) => a - b) });
    }
  };

  const handleSubmit = () => {
    // Generate email with selected bonus services
    const selectedServices = state.selectedBonusServices.map(index => BONUS_SERVICES[index]);

    const emailSubject = encodeURIComponent("🎂 Bubu's Birthday Adventure - Selected Rewards!");
    const emailBody = encodeURIComponent(
      `🌟 Hello!\n\n` +
      `Bubu has completed her birthday scavenger hunt and selected her bonus rewards!\n\n` +
      `📋 Selected Rewards:\n${selectedServices.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `🎉 Total Points Collected: 300 Bubu Points\n\n` +
      `Hope you enjoy fulfilling these!💕`
    );

    // Open email client with pre-filled content
    const mailtoLink = `mailto:${YOUR_EMAIL}?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoLink, '_blank');

    // Direct localStorage update
    try {
      const stored = localStorage.getItem('bubu_rapido_state');
      if (stored) {
        const state = JSON.parse(stored);
        state.currentPhase = 5;
        localStorage.setItem('bubu_rapido_state', JSON.stringify(state));
      }
    } catch (err) {
      console.error("Failed to update localStorage", err);
    }
    // Force reload to complete navigation
    setTimeout(() => window.location.reload(), 50);
  };

  const canSubmit = state.selectedBonusServices.length === 3;

  return (
    <div className="min-h-screen flex flex-col px-5 py-6">
      <PointsBadge points={state.bubuPoints} />

      {/* Confetti */}
      <AnimatePresence>
        {confettiActive && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {[...Array(30)].map((_, i) => {
              const colors = ["#E91E63", "#FF4081", "#FFD700", "#4CAF50", "#FFCCD5"];
              const color = colors[i % colors.length];
              return (
                <motion.div key={i} initial={{ y: -20, opacity: 1 }} animate={{ y: "100vh", opacity: 0, rotate: 720 }} transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, ease: "easeOut" }} className="absolute w-2.5 h-2.5 rounded-full" style={{ left: `${Math.random() * 100}%`, backgroundColor: color }} />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <Header showThemeToggle={false} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center space-y-4 py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
            <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary">Congratulations!</h2>
            <p className="text-text-secondary mt-2">You've collected 300 Bubu Points on your birthday adventure!</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-gold fill-gold" />
            <span className="text-2xl font-bold text-gold">300 Points</span>
            <Star className="w-6 h-6 text-gold fill-gold" />
          </div>
        </motion.div>

        {/* Bonus Services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-text-primary">Choose 3 bonus rewards</h3>
            <p className="text-sm text-text-secondary">(Select exactly 3)</p>
          </div>

          <div className="space-y-3">
            {BONUS_SERVICES.map((service, index) => {
              const isSelected = state.selectedBonusServices.includes(index);
              const isMaxReached = state.selectedBonusServices.length >= 3 && !isSelected;

              return (
                <motion.button key={index} whileHover={!isMaxReached ? { scale: 1.01 } : {}} whileTap={!isMaxReached ? { scale: 0.99 } : {}} onClick={() => !isMaxReached && toggleBonus(index)} disabled={isMaxReached} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/10" : isMaxReached ? "border-muted bg-muted/20 opacity-50" : "border-muted bg-surface hover:border-primary/50"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl ${isSelected ? "text-primary" : "text-text-secondary/50"}`}>{isSelected ? "★" : "☆"}</span>
                    <p className={`text-sm ${isSelected ? "text-primary font-medium" : "text-text-primary"}`}>{service}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div className={`text-center py-2 px-4 rounded-full ${state.selectedBonusServices.length === 3 ? "bg-success/20 text-success" : "bg-muted/30 text-text-secondary"}`}>
            <span className="font-bold">{state.selectedBonusServices.length} / 3 selected</span>
          </motion.div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full text-lg py-4 rounded-full font-bold shadow-lg transition-all ${canSubmit ? "bg-primary text-white hover:bg-primary-dark" : "bg-muted text-text-secondary opacity-50 cursor-not-allowed"}`}
          >
            Confirm Selection
          </button>
        </motion.div>
      </div>

      {showDevMode && <div className="fixed bottom-2 left-2 text-xs text-text-secondary/40">Phase 4</div>}
    </div>
  );
}