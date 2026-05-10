"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, AlertCircle, Camera } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { LOCATIONS, CLUE_TIMER_SECONDS, ARRIVAL_RADIUS_METERS } from "@/lib/constants";
import { haversineDistance } from "@/lib/haversine";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { SuccessAnimation } from "@/components/ui/SuccessAnimation";
import { PointsBadge } from "@/components/ui/PointsBadge";
import { Header } from "@/components/shared/Header";
import { getCameraStream, captureFrame } from "@/lib/photoUtils";

interface Phase3ClueProps {
  onPhaseComplete: () => void;
  showDevMode?: boolean;
  onSkipPhase?: () => void;
  forceRemount?: () => void;
}

export function Phase3Clue({ onPhaseComplete, showDevMode, onSkipPhase, forceRemount }: Phase3ClueProps) {
  const { state, updateState } = useGameState();
  const [userAnswer, setUserAnswer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMapReward, setShowMapReward] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsNoSignal, setGpsNoSignal] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoTapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentLocation = LOCATIONS[state.currentLocationIndex];
  const isLastLocation = state.currentLocationIndex === 2;

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (!cooldownEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  // Camera functions
  const startCamera = async () => {
    console.log('📷 startCamera called');

    // Step 1 — Get stream FIRST (permission prompt happens here)
    const stream = await getCameraStream();

    if (!stream) {
      // getCameraStream already shows specific error alerts
      console.log('❌ No stream returned');
      return;
    }

    // Step 2 — Store stream immediately so cleanup works
    streamRef.current = stream;

    // Step 3 — Show the camera UI (this mounts the <video> element)
    setShowCamera(true);

    // Step 4 — Wait for React to render the video element
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 5 — Now attach stream to video element
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
        console.log('✅ Camera playing');
      } catch (playErr) {
        console.error('❌ play() failed:', playErr);
      }
    } else {
      console.error('❌ videoRef still null after delay');
      // Clean up stream since we cannot display it
      stream.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const photo = captureFrame(videoRef.current);
      setCapturedPhoto(photo);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
      setPhotoTaken(true);
      // Save photo to state
      const currentPhotos = state.photos || [];
      const updatedPhotos = [...currentPhotos, photo];
      // Keep only last 3 photos (for 3 locations)
      while (updatedPhotos.length > 3) updatedPhotos.shift();
      updateState({ photos: updatedPhotos });
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // GPS tracking - continue even after success to detect arrival
  useEffect(() => {
    if (!currentLocation) return;

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

        // Enable completion when within 50m AND answer already correct
        if (distance <= ARRIVAL_RADIUS_METERS && showSuccess && !canComplete) {
          setCanComplete(true);
          // Start 5 minute cooldown
          const cooldownEndTime = Date.now() + 5 * 60 * 1000;
          setCooldownEnd(cooldownEndTime);
          // Store in localStorage for persistence across reloads
          try {
            const stored = localStorage.getItem('bubu_rapido_state');
            if (stored) {
              const st = JSON.parse(stored);
              st.cooldownEnd = cooldownEndTime;
              localStorage.setItem('bubu_rapido_state', JSON.stringify(st));
            }
          } catch (e) { }
        }
      },
      (error) => {
        setGpsError(error.code === 1 ? "Location permission denied" : "GPS unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    gpsTimeoutRef.current = setTimeout(() => {
      if (!signalReceived && !showSuccess) setGpsNoSignal(true);
    }, 30000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
    };
  }, [currentLocation, showSuccess]);

  // Handle timer expiration
  const handleTimerExpire = () => {
    setTimerExpired(true);
    updateState({ timerExpired: true });
  };

  // Handle correct answer
  const handleCorrectAnswer = (isFromGPS = false) => {
    setShowSuccess(true);
    updateState({ bubuPoints: state.bubuPoints + 100 });
    setShowMapReward(true); // Show map immediately on correct answer
  };

  // Handle submit answer
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || showSuccess) return;

    const normalized = userAnswer.trim().toLowerCase();
    const allAnswers = [
      currentLocation.answer.toLowerCase(),
      ...currentLocation.alternateAnswers.map(a => a.toLowerCase())
    ];

    if (allAnswers.includes(normalized)) {
      handleCorrectAnswer();
    } else {
      setShakeTrigger(prev => prev + 1);
    }
  };

  // Handle continue to next location
  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Direct localStorage update
      try {
        const stored = localStorage.getItem('bubu_rapido_state');
        if (stored) {
          const st = JSON.parse(stored);
          if (isLastLocation) {
            st.currentPhase = 4;
          } else {
            st.currentLocationIndex = st.currentLocationIndex + 1;
            st.timerExpired = false;
            st.userArrived = false;
            st.answerSubmitted = false;
            st.gpsOverrideUsed = false;
          }
          localStorage.setItem('bubu_rapido_state', JSON.stringify(st));
        }
      } catch (err) {
        console.error("Failed to update localStorage", err);
      }
      // Force reload to complete navigation
      setTimeout(() => window.location.reload(), 50);
    }, 300);
  };

  // Dev mode - simulate arrival
  const handleSimulateArrival = () => {
    handleCorrectAnswer(true);
  };

  // Expose for dev mode
  useEffect(() => {
    (window as any).devSimulateArrival = handleSimulateArrival;
    (window as any).devEnableComplete = () => { setCanComplete(true); setCooldownEnd(Date.now()); setCooldownRemaining(0); };
    (window as any).devSkipToPhoto = () => { setCanComplete(true); setCooldownEnd(Date.now() + 100); setCooldownRemaining(0); };
    (window as any).devOpenCamera = startCamera;
    return () => {
      delete (window as any).devSimulateArrival;
      delete (window as any).devEnableComplete;
      delete (window as any).devSkipToPhoto;
      delete (window as any).devOpenCamera;
    };
  }, [handleCorrectAnswer]);

  const handleLogoTap = () => {
    if (!showDevMode) return;
    logoTapCount.current++;
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => { logoTapCount.current = 0; }, 500);
    if (logoTapCount.current === 5) {
      onSkipPhase?.();
      logoTapCount.current = 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-4">
      <div className="flex justify-between items-start mb-4">
        <Header onLogoTap={handleLogoTap} className="mb-0 flex-1" />
        <div className="mt-1">
          <PointsBadge points={state.bubuPoints} />
        </div>
      </div>

      <AnimatePresence>{showSuccess && <SuccessAnimation />}</AnimatePresence>

      <div className="flex-1 max-w-md mx-auto w-full space-y-4">
        {/* Location indicator */}
        <div className="text-center">
          <span className="text-sm font-semibold text-text-secondary">
            Location {state.currentLocationIndex + 1} of 3
          </span>
        </div>

        {/* Clue */}
        <div className="card">
          <p className="text-lg italic text-text-primary leading-relaxed">
            {currentLocation.clue}
          </p>
        </div>

        {/* Answer Input - Always visible */}
        {!showSuccess && (
          <motion.div
            key={shakeTrigger}
            animate={shakeTrigger > 0 ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="card space-y-3"
          >
            <p className="text-sm text-text-secondary text-center">
              What do you think this place is?
            </p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              placeholder="Type your guess..."
              className="input-field text-center"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className="btn-primary w-full"
            >
              Submit Answer
            </motion.button>
            {shakeTrigger > 0 && (
              <p className="text-sm text-text-secondary text-center">Not quite... try again!</p>
            )}
          </motion.div>
        )}

        {/* Timer - Always visible until answer correct */}
        {!showSuccess && (
          <div className="card flex flex-col items-center py-4">
            <CountdownTimer
              seconds={CLUE_TIMER_SECONDS}
              onExpire={handleTimerExpire}
            />
            <p className="text-sm text-text-secondary mt-2">
              {timerExpired ? "Time's up! Map hint revealed." : "Time until map hint"}
            </p>
          </div>
        )}

        {/* Map Hint (after timer expires) or Map Reward (after correct answer) */}
        {(timerExpired || showMapReward) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-3"
          >
            <p className="text-sm font-semibold text-text-primary text-center">
              {showMapReward ? "🎉 Here's your reward!" : "Need help? Here's a hint:"}
            </p>
            <MapEmbed
              lat={currentLocation.coordinates.lat}
              lng={currentLocation.coordinates.lng}
              zoom={currentLocation.mapZoom}
            />
            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Navigation className="w-4 h-4 animate-pulse" />
              {currentDistance === null
                ? "Tracking..."
                : currentDistance <= ARRIVAL_RADIUS_METERS
                  ? "You're here!"
                  : `${Math.round(currentDistance)}m away`}
            </div>
            {/* Start Ride Button - Opens Google Maps Navigation in Bike Mode */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.coordinates.lat},${currentLocation.coordinates.lng}&travelmode=bike`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>🛵</span> Start Ride
            </a>
            <p className="text-xs text-text-secondary text-center">Opens maps with route in bike mode</p>
          </motion.div>
        )}

        {/* Success + Points + Continue */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center space-y-4"
          >
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl font-bold text-success">Correct!</h2>
            <p className="text-lg font-semibold text-primary">+100 Bubu Points</p>
            {showMapReward && (
              <p className="text-sm text-text-secondary">Your reward map is shown above!</p>
            )}
            <motion.button
              whileHover={canComplete && !cooldownRemaining ? { scale: 1.02 } : {}}
              whileTap={canComplete && !cooldownRemaining ? { scale: 0.98 } : {}}
              onClick={handleContinue}
              disabled={isLoading || !canComplete || cooldownRemaining > 0}
              className={`btn-primary w-full ${!canComplete ? 'opacity-50' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : !canComplete ? (
                <span className="flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  Waiting for arrival...
                </span>
              ) : cooldownRemaining > 0 ? (
                `Complete in ${cooldownRemaining}s`
              ) : isLastLocation ? (
                "Finish Adventure"
              ) : photoTaken ? (
                "Next Location →"
              ) : (
                "Complete Adventure →"
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Photo capture - shows after cooldown ends */}
        {showSuccess && canComplete && cooldownRemaining === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-3"
          >
            {showCamera ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <button onClick={takePhoto} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" /> Capture
                  </button>
                  <button onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setShowCamera(false); }} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </>
            ) : capturedPhoto ? (
              <>
                <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg" />
                <button onClick={() => { setCapturedPhoto(null); setPhotoTaken(false); startCamera(); }} className="btn-secondary w-full">
                  Retake Photo
                </button>
              </>
            ) : (
              <button onClick={startCamera} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Take a Photo 📸
              </button>
            )}
          </motion.div>
        )}

        {/* GPS Status */}
        {!showSuccess && (
          <div className="text-center text-sm text-text-secondary">
            {currentDistance === null
              ? "Tracking your location..."
              : currentDistance < 200
                ? "Getting closer..."
                : "Keep searching!"}
          </div>
        )}
      </div>

      {showDevMode && (
        <div className="fixed bottom-2 left-2 text-xs text-text-secondary/40">
          Phase 3 - Loc {state.currentLocationIndex + 1}/3
        </div>
      )}
    </div>
  );
}