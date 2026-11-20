import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { INTRO_CONFIG } from '../config/intro'

interface CinematicIntroProps {
  photoUrl?: string
  targetRef: React.RefObject<HTMLElement>
  onComplete: () => void
  onStageChange?: (stage: number) => void
}

export default function CinematicIntro({
  photoUrl,
  targetRef,
  onComplete,
  onStageChange
}: CinematicIntroProps) {
  const prefersReduced = useReducedMotion()
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0)
  const [imageReady, setImageReady] = useState(false)
  const [transformStyles, setTransformStyles] = useState({
    x: 0,
    y: 0,
    scale: 1
  })
  const [isDone, setIsDone] = useState(false)
  const completedRef = useRef(false)

  // Complete and remove intro sequence cleanly
  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsDone(true)
    try {
      sessionStorage.setItem(INTRO_CONFIG.storage.sessionKey, 'true')
    } catch {
      // ignore private browsing issues
    }
    document.body.style.overflow = ''
    onStageChange?.(3)
    onComplete()
  }, [onComplete, onStageChange])

  // Skip guard: check session storage & prefers-reduced-motion immediately
  useEffect(() => {
    if (prefersReduced) {
      finish()
      return
    }

    try {
      const alreadySeen = sessionStorage.getItem(INTRO_CONFIG.storage.sessionKey)
      if (alreadySeen) {
        finish()
        return
      }
    } catch {
      // ignore
    }

    // Lock body scroll during cinematic intro
    document.body.style.overflow = 'hidden'

    // Add skip triggers (click, keydown, wheel, touch)
    const handleSkip = () => {
      finish()
    }

    window.addEventListener('click', handleSkip, { once: true })
    window.addEventListener('touchstart', handleSkip, { once: true, passive: true })
    window.addEventListener('keydown', handleSkip, { once: true })
    window.addEventListener('wheel', handleSkip, { once: true, passive: true })

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('click', handleSkip)
      window.removeEventListener('touchstart', handleSkip)
      window.removeEventListener('keydown', handleSkip)
      window.removeEventListener('wheel', handleSkip)
    }
  }, [finish, prefersReduced])

  // Preload & decode image with fallback timeout
  useEffect(() => {
    if (completedRef.current) return

    if (!photoUrl) {
      // If after short delay no photo exists, skip
      const noPhotoTimer = setTimeout(() => {
        if (!completedRef.current) finish()
      }, 600)
      return () => clearTimeout(noPhotoTimer)
    }

    let isMounted = true
    const img = new Image()
    img.src = photoUrl
    img.fetchPriority = 'high'

    // Max wait safety timer (1.5s)
    const safetyTimer = setTimeout(() => {
      if (isMounted && !imageReady) {
        // If image takes too long, skip intro
        finish()
      }
    }, INTRO_CONFIG.timings.maxImageWait * 1000)

    if (img.complete) {
      setImageReady(true)
      clearTimeout(safetyTimer)
    } else {
      img
        .decode()
        .then(() => {
          if (isMounted) {
            setImageReady(true)
            clearTimeout(safetyTimer)
          }
        })
        .catch(() => {
          // If decode fails, trigger imageReady anyway or fallback
          if (isMounted) setImageReady(true)
        })
    }

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [photoUrl, finish, imageReady])

  // Sequence Timeline Controller
  useEffect(() => {
    if (!imageReady || completedRef.current) return

    // Stage 0 -> Stage 1 (0.25s)
    const t1 = setTimeout(() => {
      if (completedRef.current) return
      setStage(1)
      onStageChange?.(1)
    }, INTRO_CONFIG.timings.stage0Blackout * 1000)

    // Stage 1 -> Stage 2: Measure target & trigger travel (1.1s)
    const t2 = setTimeout(() => {
      if (completedRef.current) return

      if (targetRef.current) {
        const targetRect = targetRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth < 640
        const initialSize = isMobile
          ? INTRO_CONFIG.sizes.mobileIntroSize
          : INTRO_CONFIG.sizes.desktopIntroSize

        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2

        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2

        const deltaX = targetCenterX - centerX
        const deltaY = targetCenterY - centerY
        const scale = targetRect.width / initialSize

        setTransformStyles({ x: deltaX, y: deltaY, scale })
      }

      setStage(2)
      onStageChange?.(2)
    }, (INTRO_CONFIG.timings.stage0Blackout + INTRO_CONFIG.timings.stage1FadeIn) * 1000)

    // Stage 2 -> Stage 3: Hero content reveal (1.3s, overlaps Stage 2 travel)
    const t3 = setTimeout(() => {
      if (completedRef.current) return
      setStage(3)
      onStageChange?.(3)
    }, (INTRO_CONFIG.timings.stage0Blackout + INTRO_CONFIG.timings.stage1FadeIn + 0.2) * 1000)

    // End State: Handoff to real hero and remove overlay (2.3s)
    const tEnd = setTimeout(() => {
      finish()
    }, (INTRO_CONFIG.timings.stage0Blackout + INTRO_CONFIG.timings.stage1FadeIn + INTRO_CONFIG.timings.stage2Travel) * 1000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(tEnd)
    }
  }, [imageReady, finish, targetRef, onStageChange])

  // If completed or no photo, render nothing
  if (isDone || !photoUrl) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const introSize = isMobile
    ? INTRO_CONFIG.sizes.mobileIntroSize
    : INTRO_CONFIG.sizes.desktopIntroSize

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-paper transition-opacity duration-300 ${
        stage === 3 ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-hidden="true"
    >
      {/* Moving Portrait Element (GPU Animated Transform) */}
      <motion.div
        animate={
          stage >= 2
            ? {
                x: transformStyles.x,
                y: transformStyles.y,
                scale: transformStyles.scale,
                opacity: 1
              }
            : stage === 1
            ? {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1
              }
            : {
                x: 0,
                y: 0,
                scale: 0.92,
                opacity: 0
              }
        }
        transition={{
          duration:
            stage >= 2
              ? INTRO_CONFIG.timings.stage2Travel
              : INTRO_CONFIG.timings.stage1FadeIn,
          ease:
            stage >= 2
              ? INTRO_CONFIG.easings.travelBezier
              : INTRO_CONFIG.easings.fadeBezier
        }}
        style={{
          width: introSize,
          height: introSize,
          willChange: 'transform, opacity'
        }}
        className="relative flex items-center justify-center aspect-square"
      >
        {/* Soft Ambient Glow */}
        <div
          className="absolute -inset-8 rounded-full opacity-50 blur-3xl pointer-events-none transition-opacity duration-700"
          style={{
            background: INTRO_CONFIG.gradients.glow
          }}
        />

        {/* The Animated Gradient Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={
            stage >= 1
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.88 }
          }
          transition={{
            duration: INTRO_CONFIG.timings.stage1FadeIn,
            ease: INTRO_CONFIG.easings.fadeBezier
          }}
          className="absolute inset-3 rounded-full p-[2px]"
          style={{
            background: INTRO_CONFIG.gradients.ring,
            boxShadow: '0 0 50px -10px rgba(111, 143, 255, 0.45)'
          }}
        >
          <div className="h-full w-full rounded-full bg-paper" />
        </motion.div>

        {/* Blended Portrait Photo with Edge Dissolve */}
        <div
          className="relative z-10 flex h-[90%] w-[90%] items-center justify-center overflow-hidden"
          style={{
            WebkitMaskImage: 'radial-gradient(circle at center, black 58%, transparent 72%)',
            maskImage: 'radial-gradient(circle at center, black 58%, transparent 72%)'
          }}
        >
          <img
            src={photoUrl}
            alt="Earnest Abraham Portrait"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </motion.div>

      {/* Skip Hint pill at bottom right */}
      {stage >= 1 && (
        <div className="absolute bottom-6 right-6 text-[11px] font-medium tracking-wider text-mute/50 uppercase select-none">
          Click or press any key to skip
        </div>
      )}
    </div>
  )
}
