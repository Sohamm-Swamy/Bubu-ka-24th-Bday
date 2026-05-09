"use client";

import { useEffect, useState, useRef } from "react";

interface CountdownTimerProps {
  seconds: number;
  onExpire: () => void;
}

export function CountdownTimer({ seconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    setIsExpired(false);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsExpired(true);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [seconds, onExpire]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = (remaining / seconds) * circumference;
  const offset = circumference - progress;

  // Determine color based on remaining time
  let strokeColor = "#C9184A"; // rose
  if (remaining <= 10) {
    strokeColor = "#FF0000"; // red
  } else if (remaining <= 20) {
    strokeColor = "#FF6B00"; // orange
  }

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="#FFCCD5"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-linear"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-4xl font-bold ${
            isExpired ? "text-primary" : "text-text-primary"
          }`}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
