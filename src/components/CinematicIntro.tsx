import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { INTRO_CONFIG } from '../config/intro'

interface CinematicIntroProps {
  photoUrl?: string
  isReady?: boolean
  targetRef: React.RefObject<HTMLElement>
  onComplete: () => void
  onStageChange?: (stage: number) => void
}

export default function CinematicIntro({
  photoUrl,
  isReady = true,
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

  // Keep references to latest callbacks and refs without triggering effect restarts
  const callbacksRef = useRef({ onComplete, onStageChange, targetRef })
  useEffect(() => {
    callbacksRef.current = { onComplete, onStageChange, targetRef }
  })

  // Complete and remove intro sequence cleanly
  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsDone(true)

    try {
      sessionStorage.setItem(INTRO_CONFIG.storage.sessionKey, 'true')
    } catch {
      // ignore
    }

    try {
      document.body.style.overflow = ''
    } catch {
      // ignore
    }

    callbacksRef.current.onStageChange?.(3)
    callbacksRef.current.onComplete()
  }, [])

  // Absolute hard timeout: force completion after hardTimeout seconds no matter what
  useEffect(() => {
    const hardTimer = setTimeout(() => {
      if (!completedRef.current) {
        finish()
      }
    }, INTRO_CONFIG.timings.hardTimeout * 1000)

    return () => clearTimeout(hardTimer)
  }, [finish])

  // Skip immediately if reduced motion or already completed in this session
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
  }, [finish, prefersReduced])

  // If database is ready and there is no photo, skip intro cleanly
  useEffect(() => {
    if (isReady && !photoUrl) {
      finish()
    }
  }, [isReady, photoUrl, finish])

  // Safety wait timer while database initializes: if no photo after 1.2s, skip intro
  useEffect(() => {
    if (!isReady && !photoUrl) {
      const waitTimer = setTimeout(() => {
        if (!completedRef.current) finish()
      }, 1200)
      return () => clearTimeout(waitTimer)
    }
  }, [isReady, photoUrl, finish])

  // Body scroll lock management: lock during center stage, unlock as soon as travel starts
  useEffect(() => {
    if (!isDone && photoUrl && imageReady && stage < 2) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isDone, photoUrl, imageReady, stage])

  // Skip triggers (click, keydown, wheel, touch)
  useEffect(() => {
    const handleSkip = () => finish()

    window.addEventListener('click', handleSkip, { once: true })
    window.addEventListener('touchstart', handleSkip, { once: true, passive: true })
    window.addEventListener('keydown', handleSkip, { once: true })
    window.addEventListener('wheel', handleSkip, { once: true, passive: true })

    return () => {
      window.removeEventListener('click', handleSkip)
      window.removeEventListener('touchstart', handleSkip)
      window.removeEventListener('keydown', handleSkip)
      window.removeEventListener('wheel', handleSkip)
    }
  }, [finish])

  // Preload image with fallback timeout
  useEffect(() => {
    if (completedRef.current || !photoUrl) return

    let isMounted = true
    const img = new Image()
    img.src = photoUrl
    img.fetchPriority = 'high'

    // Max wait safety timer (1.5s): skip intro if image decode hangs
    const safetyTimer = setTimeout(() => {
      if (isMounted && !completedRef.current) {
        finish()
      }
    }, INTRO_CONFIG.timings.maxImageWait * 1000)

    img.onload = () => {
      if (isMounted && !completedRef.current) {
        clearTimeout(safetyTimer)
        setImageReady(true)
      }
    }

    img.onerror = () => {
      if (isMounted && !completedRef.current) {
        clearTimeout(safetyTimer)
        finish()
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      clearTimeout(safetyTimer)
      setImageReady(true)
    }

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [photoUrl, finish])

  // Master Sequence Timeline Controller (depends ONLY on [imageReady, finish])
  useEffect(() => {
    if (!imageReady || completedRef.current) return

    // Stage 0 -> Stage 1: Reveal centered portrait (0.1s)
    const t1 = setTimeout(() => {
      if (completedRef.current) return
      setStage(1)
      callbacksRef.current.onStageChange?.(1)
    }, INTRO_CONFIG.timings.stage0Blackout * 1000)

    // Stage 1 -> Stage 2: Measure target & trigger continuous glide to hero
    const t2 = setTimeout(() => {
      if (completedRef.current) return

      const targetEl = callbacksRef.current.targetRef.current
      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect()
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
        const scale = targetRect.width > 0 ? targetRect.width / initialSize : 1

        setTransformStyles({ x: deltaX, y: deltaY, scale })
      }

      setStage(2)
      callbacksRef.current.onStageChange?.(2)
    }, (INTRO_CONFIG.timings.stage0Blackout + INTRO_CONFIG.timings.stage1FadeIn) * 1000)

    // End State: Exactly when travel completes, hand off directly to hero portrait
    const tEnd = setTimeout(() => {
      finish()
    }, (INTRO_CONFIG.timings.stage0Blackout + INTRO_CONFIG.timings.stage1FadeIn + INTRO_CONFIG.timings.stage2Travel) * 1000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(tEnd)
    }
  }, [imageReady, finish])

  // If completed, unmount
  if (isDone) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const introSize = isMobile
    ? INTRO_CONFIG.sizes.mobileIntroSize
    : INTRO_CONFIG.sizes.desktopIntroSize

  return (
    <motion.div
      initial={{ backgroundColor: '#0A0A12' }}
      animate={
        stage >= 2
          ? { backgroundColor: 'rgba(10, 10, 18, 0)' }
          : { backgroundColor: '#0A0A12' }
      }
      transition={{ duration: 0.65, ease: 'easeInOut' }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        stage >= 2 ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-hidden="true"
    >
      {/* Moving Portrait Element: Starts centered and travels smoothly to hero position */}
      {photoUrl && imageReady && (
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
            willChange: 'transform'
          }}
          className="relative flex items-center justify-center aspect-square"
        >
          {/* Soft Ambient Glow matching the studio portrait lighting */}
          <div
            className="absolute -inset-8 rounded-full opacity-50 blur-3xl pointer-events-none transition-opacity duration-700"
            style={{
              background: INTRO_CONFIG.gradients.glow
            }}
          />

          {/* The Signature Gradient Ring (Violet -> Periwinkle Blue -> Light Blue) */}
          <div
            className="absolute inset-3 rounded-full p-[2px]"
            style={{
              background: INTRO_CONFIG.gradients.ring,
              boxShadow: '0 0 50px -10px rgba(111, 143, 255, 0.45)'
            }}
          >
            <div className="h-full w-full rounded-full bg-paper" />
          </div>

          {/* Blended Portrait Photo with Radial Edge Dissolve */}
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
      )}

      {/* Skip Hint pill at bottom right */}
      {stage === 1 && (
        <div className="absolute bottom-6 right-6 text-[11px] font-medium tracking-wider text-mute/50 uppercase select-none pointer-events-none">
          Click or press any key to skip
        </div>
      )}
    </motion.div>
  )
}
