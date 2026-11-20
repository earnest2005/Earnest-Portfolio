/**
 * Cinematic Opening Sequence Configuration
 * Easily tweak timings, easings, sizes, and gradient tokens here.
 */

export const INTRO_CONFIG = {
  // Timing values in seconds (Target: ~1.8s total cinematic sequence)
  timings: {
    stage0Blackout: 0.1,     // Stage 0: brief initial dark setup
    stage1FadeIn: 0.75,      // Stage 1: portrait fades in & scales prominently at screen center
    stage2Travel: 0.95,      // Stage 2: smooth continuous glide to target hero slot
    maxImageWait: 1.2,       // Max wait for image decode before skipping intro
    hardTimeout: 3.5,        // Absolute safety timeout: force-complete intro
  },

  // Refined cubic-bezier easings
  easings: {
    travelBezier: [0.22, 1, 0.36, 1] as const, // Smooth cinematic deceleration
    fadeBezier: [0.25, 0.1, 0.25, 1] as const,
  },

  // Dimensions
  sizes: {
    desktopIntroSize: 420,    // Center portrait size on desktop (px)
    mobileIntroSize: 280,     // Center portrait size on mobile (px)
  },

  // Gradient tokens matching the studio photo lighting
  gradients: {
    ring: 'linear-gradient(135deg, #9277E0 0%, #6F8FFF 50%, #7CB4FF 100%)',
    glow: 'radial-gradient(circle, #9277E0 0%, #6F8FFF 50%, #7CB4FF 100%)',
  },

  // Storage keys
  storage: {
    sessionKey: 'ea_intro_completed_v1',
    cacheKey: 'ea_portfolio_data_v1',
  }
}
