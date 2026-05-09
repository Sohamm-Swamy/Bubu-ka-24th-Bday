"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  disabled?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = "sm",
  disabled = false,
}: StarRatingProps) {
  const starSize = size === "lg" ? "w-10 h-10" : "w-6 h-6";
  const starColor = "#FFB800";
  const unselectedColor = "#FFCCD5";

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          whileHover={!disabled ? { scale: 1.2 } : {}}
          whileTap={!disabled ? { scale: 0.9 } : {}}
          className="transition-transform"
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={starSize}
            fill={star <= (value || 0) ? starColor : "none"}
            stroke={star <= (value || 0) ? starColor : unselectedColor}
            strokeWidth={2}
          />
        </motion.button>
      ))}
    </div>
  );
}
