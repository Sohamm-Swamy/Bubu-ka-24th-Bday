"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface CountdownTimerProps {
  seconds: number;
  onExpire: () => void;
}

export function CountdownTimer({ seconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledExpire = useRef(false);

  // Stable callback reference
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setRemaining(seconds);
    setIsExpired(false);
    hasCalledExpire.current = false;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsExpired(true);
          if (!hasCalledExpire.current) {
            hasCalledExpire.current = true;
            // Use setTimeout to avoid calling during render
            setTimeout(() => {
              onExpireRef.current();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => {
    // Only start timer if not expired and no interval running
    if (!isExpired && !intervalRef.current) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Sync with external state changes
  useEffect(() => {
    // If parent says timer expired, sync our state
    if (isExpired !== (remaining === 0)) {
      if (remaining === 0) {
        setIsExpired(true);
      }
    }
  }, [remaining, isExpired]);

  const circumference = 2 * Math.PI * 45;
  const progress = (remaining / seconds) * circumference;
  const offset = circumference - progress;

  let strokeColor = "#1976D2";
  if (remaining <= 10) {
    strokeColor = "#FF0000";
  } else if (remaining <= 20) {
    strokeColor = "#FF6B00";
  }

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="8"
        />
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
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl font-bold ${isExpired ? "text-primary" : "text-text-primary"}`}>
          {remaining}
        </span>
      </div>
    </div>
  );
}