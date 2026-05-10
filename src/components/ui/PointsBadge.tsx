"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface PointsBadgeProps {
  points: number;
}

export function PointsBadge({ points }: PointsBadgeProps) {
  const [isDark, setIsDark] = useState(false);

  // Read theme from localStorage and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem('bubu_rapido_theme');
      setIsDark(theme === 'dark');
    };

    checkTheme();

    // Listen for storage changes (when theme is toggled in another tab/window)
    window.addEventListener('storage', checkTheme);

    // Poll for changes (since storage event doesn't fire in same window)
    const interval = setInterval(checkTheme, 500);

    return () => {
      window.removeEventListener('storage', checkTheme);
      clearInterval(interval);
    };
  }, []);

  // Also check for class changes on document (how theme is applied)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Light mode: dark blue background with primary text
  // Dark mode: gold background with white text
  const bgColor = isDark ? "bg-gold/90" : "bg-[#0D1B2A]";
  const textColor = isDark ? "text-white" : "text-[#1976D2]";
  const borderColor = isDark ? "border-gold" : "border-[#0D1B2A]";
  const starColor = isDark ? "fill-white text-white" : "fill-[#1976D2] text-[#1976D2]";

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
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 shadow-sm border ${borderColor} ${bgColor}`}
      >
        <Star className={`w-3 h-3 ${starColor}`} />
        <span className={`font-semibold text-xs ${textColor}`}>
          {points} Bubu Points
        </span>
      </motion.div>
    </motion.div>
  );
}
