/**
 * Cinematic Opening Sequence Configuration
 * Easily tweak timings, easings, sizes, and gradient tokens here.
 */

export const INTRO_CONFIG = {
  // Timing values in seconds
  timings: {
    stage0Blackout: 0.25,     // Stage 0: pure dark canvas
    stage1FadeIn: 0.85,       // Stage 1: portrait fades in & scales at screen center
    stage2Travel: 1.05,       // Stage 2: smooth glide to target hero slot
    stage3HeroStagger: 0.09,  // Stage 3: stagger delay between hero elements
    maxImageWait: 1.5,        // Max wait for cold image decode before skipping intro
    totalDuration: 2.8,       // Overall safety cap
  },

  // Refined easings
  easings: {
    // Elegant cubic-bezier for the travel motion (no cartoonish bounce)
    travelBezier: [0.22, 1, 0.36, 1] as const,
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
