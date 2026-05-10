"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Camera } from "lucide-react";
import { useGameState } from "@/lib/useGameState";
import { StarRating } from "@/components/ui/StarRating";
import { Header } from "@/components/shared/Header";
import { downloadMemoryWithPhoto, getCameraStream, captureFrame } from "@/lib/photoUtils";

interface Phase5OutroProps {
  showDevMode?: boolean;
  forceRemount?: () => void;
}

export function Phase5Outro({ showDevMode, forceRemount }: Phase5OutroProps) {
  const { state, updateState, resetState } = useGameState();
  const [subScreen, setSubScreen] = useState<1 | 2 | 3>(1);
  const [momentText, setMomentText] = useState(state.memorableMoment);
  const [finalRating, setFinalRating] = useState<number | null>(state.finalRating);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSaveMemory = () => {
    if (momentText.trim()) {
      updateState({ memorableMoment: momentText.trim() });
      setIsLoading(true);
      setTimeout(() => { setSubScreen(2); setIsLoading(false); }, 300);
    }
  };

  // Camera handlers
  const startCamera = async () => {
    console.log('📷 startCamera called (Phase 5)');

    // Step 1 — Get stream first
    const stream = await getCameraStream();

    if (!stream) {
      console.log('❌ No stream returned');
      return;
    }

    // Step 2 — Store stream
    streamRef.current = stream;

    // Step 3 — Mount video element
    setShowCamera(true);

    // Step 4 — Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 5 — Attach to video
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
        console.log('✅ Camera playing (Phase 5)');
      } catch (playErr) {
        console.error('❌ play() failed:', playErr);
      }
    } else {
      console.error('❌ videoRef null after delay');
      stream.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const photo = captureFrame(videoRef.current);
      setCapturedPhoto(photo);
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFinalRating = (rating: number) => setFinalRating(rating);

  const handleSubmitRating = () => {
    if (finalRating) {
      updateState({ finalRating });
      setIsLoading(true);
      setTimeout(() => { setSubScreen(3); setIsLoading(false); }, 300);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6">
      <Header showThemeToggle={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {subScreen === 1 && (
            <motion.div key="screen1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <div className="text-center mb-6">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">One last thing...</h2>
                <p className="text-text-secondary">What was the best moment of your adventure?</p>
              </div>

              <textarea value={momentText} onChange={(e) => setMomentText(e.target.value)} placeholder="Write your thoughts here..." rows={5} className="input-field resize-none" />

              {/* Show location photos from Phase 3 */}
              {state.photos && state.photos.length > 0 && (
                <div className="card space-y-3">
                  <p className="text-sm font-semibold text-text-primary text-center">Your Adventure Photos 📸</p>
                  <div className="grid grid-cols-3 gap-2">
                    {state.photos.map((photo, index) => (
                      photo && (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Location ${index + 1}`} className="w-full rounded-lg" />
                          <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                            {index + 1}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Photo capture */}
              {showCamera ? (
                <div className="card space-y-3">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
                  <div className="flex gap-2">
                    <button onClick={takePhoto} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5" /> Capture
                    </button>
                    <button onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setShowCamera(false); }} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div className="card space-y-3">
                  <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg" />
                  <button onClick={retakePhoto} className="btn-secondary w-full">Retake Photo</button>
                </div>
              ) : (
                <button onClick={startCamera} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" /> Take a Photo
                </button>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { downloadMemoryWithPhoto(momentText.trim(), capturedPhoto, state.photos || []); handleSaveMemory(); }} disabled={!momentText.trim() || isLoading} className="btn-primary w-full text-lg py-4">
                {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : "Save & Download Memory"}
              </motion.button>
            </motion.div>
          )}

          {subScreen === 2 && (
            <motion.div key="screen2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center">
                  <StarRating value={finalRating} onChange={handleFinalRating} size="lg" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mt-6">How was your experience?</h2>
                <p className="text-text-secondary text-sm mt-2">Rate your birthday adventure</p>

                {/* Custom messages for each star rating */}
                {finalRating === 5 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-semibold mt-4">
                    The BEST birthday ever! I'm so lucky to have you! 💕
                  </motion.p>
                )}
                {finalRating === 4 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-semibold mt-4">
                    Almost perfect! Just means we need more adventures together! ✨
                  </motion.p>
                )}
                {finalRating === 3 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-text-secondary mt-4">
                    Good but can be better! Next year will be even more amazing! 🎉
                  </motion.p>
                )}
                {finalRating === 2 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-text-secondary mt-4">
                    I'll plan better next time, I promise! Still love you! 🥺
                  </motion.p>
                )}
                {finalRating === 1 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-text-secondary mt-4">
                    Oh no! Tell me what went wrong so I can fix it! 💔
                  </motion.p>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitRating} disabled={!finalRating || isLoading} className="btn-primary w-full text-lg py-4">
                {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</span> : "Submit Rating"}
              </motion.button>
            </motion.div>
          )}

          {subScreen === 3 && (
            <motion.div key="screen3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
              {/* Animated heart */}
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="flex justify-center">
                <Heart className="w-20 h-20 text-primary fill-primary" />
              </motion.div>

              {/* Floating hearts - spread across ENTIRE screen */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {[...Array(20)].map((_, i) => {
                  const startX = Math.random() * 100;
                  const startY = Math.random() * 100;
                  const duration = 5 + Math.random() * 5;
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: `${startX}%`, y: `${startY}%`, opacity: 0 }}
                      animate={{
                        x: [`${startX}%`, `${startX + (Math.random() - 0.5) * 20}%`],
                        y: [`${startY}%`, `${startY - 30 + Math.random() * 60}%`],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{ duration, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
                      className="absolute text-2xl"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                      }}
                    >
                      <Heart className={`text-${['primary', 'secondary', 'pink-300', 'rose-300'][i % 4]}/40`} />
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <p className="text-xl font-bold text-text-primary">Thank you for being my passenger</p>
                  <p className="text-xl font-bold text-text-primary mt-1">forever and always.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-1">
                  <p className="text-text-secondary">Here's to many more adventures,</p>
                  <p className="text-text-secondary">many more memories...</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <p className="text-2xl font-extrabold text-primary">Happy 24th Birthday!</p>
                </motion.div>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm text-text-secondary mt-8">Made with love, just for you</motion.p>

              {/* Book Again Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                onClick={() => {
                  resetState();
                  setTimeout(() => window.location.reload(), 50);
                }}
                className="btn-primary w-full text-lg py-4 mt-8"
              >
                Book Again 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showDevMode && <div className="fixed bottom-2 left-2 text-xs text-text-secondary/40">Phase 5 - Screen {subScreen}</div>}
    </div>
  );
}