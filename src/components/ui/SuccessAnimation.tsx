"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Create confetti particles
  const confettiColors = ["#C9184A", "#FF4D6D", "#FFB800", "#4CAF50", "#FFCCD5"];
  const confettiCount = 20;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20"
        >
          {/* Confetti burst */}
          <div className="relative">
            {Array.from({ length: confettiCount }).map((_, i) => {
              const angle = (360 / confettiCount) * i;
              const distance = 100 + Math.random() * 50;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;
              const color = confettiColors[i % confettiColors.length];
              const delay = Math.random() * 0.2;
              const duration = 0.5 + Math.random() * 0.3;

              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x,
                    y,
                    scale: 1,
                    opacity: 0,
                  }}
                  transition={{
                    duration,
                    delay,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Success checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="w-24 h-24 rounded-full bg-success flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Expanding ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
              }}
              className="absolute left-1/2 top-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full border-4 border-success"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
