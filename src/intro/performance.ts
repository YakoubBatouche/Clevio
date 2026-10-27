/** Development-only, local frame pacing evidence for the complete intro. */
export function startIntroProfile(): () => void {
  const samples: number[] = []
  let previous = 0
  let frame = 0
  let stopped = false

  const resetClock = () => { previous = 0 }
  const sample = () => {
    if (stopped) return
    const now = performance.now()
    if (!document.hidden) {
      if (previous) samples.push(now - previous)
      previous = now
    } else previous = 0
    frame = window.requestAnimationFrame(sample)
  }
  document.addEventListener('visibilitychange', resetClock)
  frame = window.requestAnimationFrame(sample)

  return () => {
    if (stopped) return
    stopped = true
    window.cancelAnimationFrame(frame)
    document.removeEventListener('visibilitychange', resetClock)
    // StrictMode's discarded setup has no completed intervals to report.
    if (!samples.length) return
    const ordered = [...samples].sort((a, b) => a - b)
    const elapsed = samples.reduce((total, value) => total + value, 0)
    const round = (value: number) => Math.round(value * 100) / 100
    console.info('CLEVIO_INTRO_PROFILE', JSON.stringify({
      frames: samples.length,
      avgFps: round(samples.length * 1000 / elapsed),
      p95FrameMs: round(ordered[Math.ceil(ordered.length * 0.95) - 1]),
      maxFrameMs: round(ordered[ordered.length - 1]),
      overBudgetFrames: samples.filter((value) => value > 20).length,
      longFrames: samples.filter((value) => value > 50).length,
    }))
  }
}
