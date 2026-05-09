"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, CheckCircle, AlertCircle } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { LOCATIONS, CLUE_TIMER_SECONDS, ARRIVAL_RADIUS_METERS } from "@/lib/constants";
import { haversineDistance } from "@/lib/haversine";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { SuccessAnimation } from "@/components/ui/SuccessAnimation";
import { PointsBadge } from "@/components/ui/PointsBadge";
import { StarRating } from "@/components/ui/StarRating";

interface Phase3ClueProps {
  onPhaseComplete: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
}

export function Phase3Clue({
  onPhaseComplete,
  showDevMode,
  onSkipPhase,
}: Phase3ClueProps) {
  const { state, updateState } = useGameState();
  const [userAnswer, setUserAnswer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsNoSignal, setGpsNoSignal] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoTapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentLocation = LOCATIONS[state.currentLocationIndex];
  const isLastLocation = state.currentLocationIndex === 2;

  // Reset phase 3 state when location changes
  useEffect(() => {
    return () => {
      // Cleanup GPS on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (gpsTimeoutRef.current) {
        clearTimeout(gpsTimeoutRef.current);
      }
    };
  }, []);

  // GPS Tracking
  useEffect(() => {
    if (!currentLocation || state.userArrived) {
      return;
    }

    let signalReceived = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        signalReceived = true;
        setGpsNoSignal(false);
        setGpsError(null);

        const distance = haversineDistance(
          position.coords.latitude,
          position.coords.longitude,
          currentLocation.coordinates.lat,
          currentLocation.coordinates.lng
        );

        setCurrentDistance(distance);

        if (distance <= ARRIVAL_RADIUS_METERS) {
          updateState({ userArrived: true });
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsError(
          error.code === 1
            ? "Location permission denied"
            : "GPS signal unavailable"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Show override button after 30 seconds of no GPS signal
    gpsTimeoutRef.current = setTimeout(() => {
      if (!signalReceived && !state.userArrived) {
        setGpsNoSignal(true);
      }
    }, 30000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (gpsTimeoutRef.current) {
        clearTimeout(gpsTimeoutRef.current);
      }
    };
  }, [currentLocation, state.userArrived, updateState]);

  const handleTimerExpire = () => {
    updateState({ timerExpired: true });
  };

  const handleShowMap = () => {
    updateState({ mapVisible: true });
  };

  const handleManualOverride = () => {
    updateState({ userArrived: true, gpsOverrideUsed: true });
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleSubmitAnswer = () => {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const allAnswers = [
      currentLocation.answer.toLowerCase(),
      ...currentLocation.alternateAnswers.map((a) => a.toLowerCase()),
    ];

    const isCorrect = allAnswers.includes(normalizedAnswer);

    if (isCorrect) {
      setShowSuccess(true);
      const newPoints = state.bubuPoints + 100;
      updateState({ bubuPoints: newPoints });

      setTimeout(() => {
        setShowContinue(true);
      }, 2000);
    } else {
      setShakeTrigger((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (isLastLocation) {
        onPhaseComplete();
      } else {
        // Move to next location and reset phase 3 state
        updateState({
          currentLocationIndex: state.currentLocationIndex + 1,
          timerExpired: false,
          mapVisible: false,
          userArrived: false,
          answerSubmitted: false,
          gpsOverrideUsed: false,
        });
      }
    }, 300);
  };

  const handleRatingSubmit = () => {
    updateState({ answerSubmitted: true });
    setTimeout(() => {
      handleContinue();
    }, 500);
  };

  const handleLogoTap = () => {
    if (!showDevMode) return;

    logoTapCount.current++;
    
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    tapTimeout.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 500);

    if (logoTapCount.current === 5) {
      onSkipPhase?.();
      logoTapCount.current = 0;
    }
  };

  // Determine current sub-step
  const showClueAndTimer = !state.timerExpired && !state.userArrived;
  const showMapHint = state.timerExpired && state.mapVisible && !state.userArrived;
  const showMapButton = state.timerExpired && !state.mapVisible && !state.userArrived;
  const showArrivalAndAnswer = state.userArrived && !state.answerSubmitted;
  const showRatings = state.answerSubmitted && !isLastLocation && state.currentLocationIndex < 2;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Points Badge */}
      <PointsBadge points={state.bubuPoints} />

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>

      {/* Header */}
      <div
        onClick={handleLogoTap}
        className="text-center mb-6 cursor-pointer"
      >
        <div className="text-4xl mb-2">🛺</div>
        <h1 className="text-2xl font-extrabold text-primary">
          Bubu ka Rapido
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-md mx-auto w-full space-y-4">
        <AnimatePresence mode="wait">
          {/* SUB-STEP A: CLUE + TIMER */}
          {showClueAndTimer && (
            <motion.div
              key="clue-timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <span className="text-sm font-semibold text-text-secondary">
                  📍 Clue #{state.currentLocationIndex + 1} of 3
                </span>
              </div>

              <div className="card">
                <p className="text-lg italic text-text-primary leading-relaxed">
                  {currentLocation.clue}
                </p>
              </div>

              <div className="card flex flex-col items-center py-8">
                <CountdownTimer
                  seconds={CLUE_TIMER_SECONDS}
                  onExpire={handleTimerExpire}
                />
                <p className="text-sm text-text-secondary mt-4">
                  Time until map hint appears
                </p>
              </div>

              {/* GPS Status Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div className="animate-pulse">📡</div>
                <span>
                  {currentDistance === null
                    ? "Tracking your location..."
                    : currentDistance < 200
                    ? "🟡 Getting closer..."
                    : "📍 Keep searching, Bubu!"}
                </span>
              </div>
            </motion.div>
          )}

          {/* SUB-STEP B: MAP BUTTON */}
          {showMapButton && (
            <motion.div
              key="map-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <span className="text-sm font-semibold text-text-secondary">
                  📍 Clue #{state.currentLocationIndex + 1} of 3
                </span>
              </div>

              <div className="card">
                <p className="text-lg italic text-text-primary leading-relaxed">
                  {currentLocation.clue}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShowMap}
                className="btn-primary w-full text-xl py-4"
              >
                🗺️ I need a map hint!
              </motion.button>

              {/* GPS Status */}
              {gpsError || gpsNoSignal ? (
                <div className="card space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">
                        GPS seems to be sleeping!
                      </p>
                      <p className="text-sm text-text-secondary">
                        Make sure location is enabled, or...
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManualOverride}
                    className="btn-secondary w-full"
                  >
                    I've reached the spot! ✋
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <div className="animate-pulse">📡</div>
                  <span>
                    {currentDistance === null
                      ? "Tracking your location..."
                      : currentDistance < 200
                      ? "🟡 Getting closer..."
                      : "📍 Keep searching, Bubu!"}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* SUB-STEP B: MAP EMBED */}
          {showMapHint && (
            <motion.div
              key="map-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <span className="text-sm font-semibold text-text-secondary">
                  📍 Clue #{state.currentLocationIndex + 1} of 3
                </span>
              </div>

              <div className="card">
                <MapEmbed
                  lat={currentLocation.coordinates.lat}
                  lng={currentLocation.coordinates.lng}
                  zoom={currentLocation.mapZoom}
                />
              </div>

              {/* GPS Status with Override */}
              {gpsError || gpsNoSignal ? (
                <div className="card space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">
                        GPS seems to be sleeping!
                      </p>
                      <p className="text-sm text-text-secondary">
                        Make sure location is enabled, or...
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManualOverride}
                    className="btn-secondary w-full"
                  >
                    I've reached the spot! ✋
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  <span>
                    {currentDistance === null
                      ? "Tracking your location..."
                      : currentDistance < 200
                      ? "🟡 Getting closer..."
                      : currentDistance <= ARRIVAL_RADIUS_METERS
                      ? "🟢 You're there!"
                      : "📍 Keep going, Bubu!"}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* SUB-STEP D & E: ARRIVAL + ANSWER */}
          {showArrivalAndAnswer && (
            <motion.div
              key="arrival-answer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Arrival Animation */}
              <div className="flex justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="text-6xl">📍</div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-primary"
                  />
                </motion.div>
              </div>

              <div className="card text-center space-y-4">
                <h2 className="text-2xl font-bold text-primary">
                  You made it! 🎉
                </h2>
                <p className="text-text-secondary">
                  Now tell me Bubu, what do you think this place is?
                </p>

                <motion.div
                  key={shakeTrigger}
                  animate={
                    shakeTrigger > 0
                      ? {
                          x: [0, -10, 10, -10, 10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitAnswer();
                      }
                    }}
                    placeholder="Type the place name here..."
                    className="input-field text-center text-lg"
                    autoFocus
                  />

                  {shakeTrigger > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-text-secondary"
                    >
                      Hmm, not quite... try again! 💭
                    </motion.p>
                  )}

                  {!showContinue && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitAnswer}
                      className="btn-primary w-full"
                    >
                      Submit My Answer ✨
                    </motion.button>
                  )}

                  {showContinue && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-lg font-bold text-success">
                        🎉 Correct! Amazing, Bubu! +100 Bubu Points!
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="btn-primary w-full"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          "Continue →"
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SUB-STEP F: RATINGS (Locations 1 & 2 only) */}
          {showRatings && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="card space-y-6">
                <h2 className="text-xl font-bold text-text-primary text-center">
                  Rate Your Experience! ⭐
                </h2>

                {/* Activity Rating */}
                <div className="space-y-3">
                  <p className="font-semibold text-text-primary">
                    How fun was this activity? 🎉
                  </p>
                  <div className="flex justify-center">
                    <StarRating
                      value={state.activityRatings[state.currentLocationIndex]}
                      onChange={(rating) =>
                        updateState({
                          activityRatings: state.activityRatings.map(
                            (r, i) =>
                              i === state.currentLocationIndex ? rating : r
                          ),
                        })
                      }
                      size="sm"
                    />
                  </div>
                </div>

                {/* Service Rating */}
                <div className="space-y-3">
                  <p className="font-semibold text-text-primary">
                    How was your Rapido Premium's service? 🛺💕
                  </p>
                  <div className="flex justify-center">
                    <StarRating
                      value={state.serviceRatings[state.currentLocationIndex]}
                      onChange={(rating) =>
                        updateState({
                          serviceRatings: state.serviceRatings.map(
                            (r, i) =>
                              i === state.currentLocationIndex ? rating : r
                          ),
                        })
                      }
                      size="sm"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRatingSubmit}
                  disabled={
                    !state.activityRatings[state.currentLocationIndex] ||
                    !state.serviceRatings[state.currentLocationIndex] ||
                    isLoading
                  }
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Ratings ✨"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dev mode indicator */}
      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/50">
          Phase 3 - Location {state.currentLocationIndex + 1}/3
        </div>
      )}
    </div>
  );
}
