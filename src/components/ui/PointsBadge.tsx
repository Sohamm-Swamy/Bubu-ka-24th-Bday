"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface PointsBadgeProps {
  points: number;
}

export function PointsBadge({ points }: PointsBadgeProps) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-40"
    >
      <motion.div
        key={points}
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gold"
      >
        <Star className="w-5 h-5 fill-gold text-gold" />
        <span className="font-bold text-text-primary">
          {points} Bubu Points
        </span>
      </motion.div>
    </motion.div>
  );
}
