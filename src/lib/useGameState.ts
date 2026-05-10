"use client";

import { useState, useEffect, useCallback } from "react";

export interface GameState {
  currentPhase: 1 | 2 | 3 | 4 | 5;
  currentLocationIndex: number;
  
  // Phase 1
  callInitiated: boolean;
  
  // Phase 2
  otpRevealed: boolean;
  
  // Phase 3 (per location — reset between locations)
  timerExpired: boolean;
  mapVisible: boolean;
  userArrived: boolean;
  answerSubmitted: boolean;
  gpsOverrideUsed: boolean;
  
  // Ratings (store as arrays, index = location index)
  activityRatings: (number | null)[];
  serviceRatings: (number | null)[];
  
  // Phase 4
  bubuPoints: number;
  selectedBonusServices: number[];
  
  // Phase 5
  memorableMoment: string;
  finalRating: number | null;

  // Photos from Phase 3 locations
  photos: string[];
}

const DEFAULT_STATE: GameState = {
  currentPhase: 1,
  currentLocationIndex: 0,
  callInitiated: false,
  otpRevealed: false,
  timerExpired: false,
  mapVisible: false,
  userArrived: false,
  answerSubmitted: false,
  gpsOverrideUsed: false,
  activityRatings: [null, null, null],
  serviceRatings: [null, null, null],
  bubuPoints: 0,
  selectedBonusServices: [],
  memorableMoment: "",
  finalRating: null,
  photos: [],
};

const STORAGE_KEY = "bubu_rapido_state";

// Safely read from localStorage with error handling
const loadFromStorage = (): GameState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default state to handle any missing fields
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
  }
  return null;
};

// Safely write to localStorage with error handling
const saveToStorage = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

export function useGameState() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);

  // Load state on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) {
      setState(loaded);
    }
    
    // Test localStorage availability
    try {
      localStorage.setItem("__test__", "test");
      localStorage.removeItem("__test__");
      setIsLocalStorageAvailable(true);
    } catch (error) {
      setIsLocalStorageAvailable(false);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state !== DEFAULT_STATE) {
      saveToStorage(state);
    }
  }, [state]);

  // Helper function to update state with automatic persistence
  const updateState = useCallback((updates: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset game state to defaults
  const resetState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    updateState,
    resetState,
    isLocalStorageAvailable,
  };
}
