"use client";

import { motion } from "framer-motion";

interface HeaderProps {
  onLogoTap?: () => void;
  className?: string;
  showThemeToggle?: boolean;
}

// Yellow scooter SVG
function YellowScooter() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" className="drop-shadow-lg">
      {/* Smoke/gas trail at back */}
      <motion.g initial={{ opacity: 0.8 }} animate={{ opacity: 0, transform: 'translateX(-8px)' }} transition={{ duration: 0.8, repeat: Infinity }}>
        <circle cx="4" cy="32" r="4" fill="#FFD700" opacity="0.6"/>
        <circle cx="0" cy="34" r="3" fill="#FFD700" opacity="0.4"/>
        <circle cx="-3" cy="36" r="2" fill="#FFD700" opacity="0.2"/>
      </motion.g>

      {/* Main body - yellow */}
      <path d="M12 40 L16 26 L40 26 L44 34 L48 34 L48 44 L12 44 Z" fill="#FFD700" stroke="#E6B800" strokeWidth="1"/>

      {/* Handlebar */}
      <path d="M38 22 L38 26 M42 22 L42 26" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>

      {/* Seat */}
      <ellipse cx="26" cy="26" rx="10" ry="4" fill="#FFD700"/>

      {/* Front wheel */}
      <circle cx="44" cy="44" r="8" fill="#333"/>
      <circle cx="44" cy="44" r="4" fill="#666"/>

      {/* Back wheel */}
      <circle cx="16" cy="44" r="8" fill="#333"/>
      <circle cx="16" cy="44" r="4" fill="#666"/>

      {/* Headlight - yellow glow */}
      <ellipse cx="48" cy="30" rx="4" ry="3" fill="#FFFACD"/>

      {/* Mirror */}
      <circle cx="38" cy="20" r="2" fill="#FFD700"/>
      <circle cx="42" cy="20" r="2" fill="#FFD700"/>
    </svg>
  );
}

export function Header({ onLogoTap, className = "", showThemeToggle }: HeaderProps) {
  return (
    <div className={`flex items-center mb-6 ${className}`}>
      {/* Logo / Title - left aligned */}
      <div
        onClick={onLogoTap}
        className="flex items-center gap-3 cursor-pointer"
      >
        <motion.div
          animate={{
            y: [0, -6, 0, -4, 0],
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <YellowScooter />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-primary">
          Bubu ka Rapido
        </h1>
      </div>
    </div>
  );
}