import { useRef, useState } from 'react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { gsap, useGSAP } from '../lib/animation'
import { INTRO_CONFIG } from '../intro/config'
import { addGlassPhase } from '../intro/glass'
import { setupCrystalTransition } from '../intro/transition'
import { setupHeroReveal } from '../intro/hero'

gsap.registerPlugin(DrawSVGPlugin)

type IntroWindow = Window & {
  introTl?: gsap.core.Timeline
  __clevioIntroBoot?: { skip: boolean; watchdog: number }
}

const isDevSkip = () => import.meta.env.DEV && new URLSearchParams(window.location.search).has('skipintro')
const shouldSkip = () => isDevSkip() || (window as IntroWindow).__clevioIntroBoot?.skip || window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function IntroPreloader() {
  const root = useRef<HTMLDivElement>(null)
  const generation = useRef(0)
  const [visible, setVisible] = useState(() => !shouldSkip())

  useGSAP((context) => {
    const run = ++generation.current
    const introWindow = window as IntroWindow
    const html = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hero = document.querySelector<HTMLElement>('.hero')
    let active = true
    let complete = false
    let preloadTimer = 0
    let master: gsap.core.Timeline | undefined
    let releaseLock = () => {}
    let releaseScene = () => {}
    let playingSize: { width: number; height: number } | undefined

    const clearWatchdog = () => window.clearTimeout(introWindow.__clevioIntroBoot?.watchdog)
    const unlock = () => {
      window.clearTimeout(preloadTimer)
      html.classList.remove('intro-pending', 'intro-revealing')
      const release = releaseLock
      releaseLock = () => {}
      release()
    }
    const restoreScene = () => {
      const release = releaseScene
      releaseScene = () => {}
      release()
    }
    const finish = (failed = false) => {
      if (!active || complete) return
      complete = true
      if (failed) html.classList.add('intro-failed')
      reducedMotion.removeEventListener('change', onReducedMotion)
      window.removeEventListener('clevio:intro-abort', failOpen)
      window.removeEventListener('resize', onResize)
      clearWatchdog()
      restoreScene()
      unlock()
      setVisible(false)
      window.dispatchEvent(new Event('clevio:intro-complete'))
    }
    const fadeHero = () => {
      if (!hero) return
      context.add(() => {
        gsap.fromTo(hero, { opacity: 0 }, {
          opacity: 1, duration: INTRO_CONFIG.duration.reducedFade, ease: INTRO_CONFIG.ease.exit,
          onComplete: () => { gsap.set(hero, { clearProps: 'opacity' }) },
        })
      })
    }
    const failOpen = () => {
      if (!active || complete) return
      master?.kill()
      finish(true)
    }
    const onReducedMotion = () => {
      if (!reducedMotion.matches || complete) return
      master?.kill()
      finish()
      fadeHero()
    }
    const onResize = () => {
      // Before playback we measure fresh; during flight we reveal the exact final layout.
      if (playingSize && (Math.abs(window.innerWidth - playingSize.width) > 2 || Math.abs(window.innerHeight - playingSize.height) > 80)) failOpen()
    }
    const cleanup = () => {
      active = false
      master?.kill()
      reducedMotion.removeEventListener('change', onReducedMotion)
      window.removeEventListener('clevio:intro-abort', failOpen)
      window.removeEventListener('resize', onResize)
      restoreScene()
      unlock()
      if (introWindow.introTl === master) delete introWindow.introTl
      queueMicrotask(() => { if (generation.current === run) clearWatchdog() })
    }

    if (shouldSkip() || html.classList.contains('intro-failed')) {
      finish()
      if (reducedMotion.matches && !isDevSkip()) fadeHero()
      return cleanup
    }

    try {
      html.classList.add('intro-pending')
      const previousOverflow = document.body.style.getPropertyValue('overflow')
      const previousPriority = document.body.style.getPropertyPriority('overflow')
      const lockedElements = [...document.querySelectorAll<HTMLElement>('.site-header, #main-content, .site-footer, .skip-link')]
        .map((element) => ({ element, inert: element.getAttribute('inert') }))
      releaseLock = () => {
        if (previousOverflow) document.body.style.setProperty('overflow', previousOverflow, previousPriority)
        else document.body.style.removeProperty('overflow')
        lockedElements.forEach(({ element, inert }) => {
          if (inert === null) element.removeAttribute('inert')
          else element.setAttribute('inert', inert)
        })
      }
      document.body.style.setProperty('overflow', 'hidden')
      lockedElements.forEach(({ element }) => element.setAttribute('inert', ''))
      reducedMotion.addEventListener('change', onReducedMotion)
      window.addEventListener('clevio:intro-abort', failOpen)
      window.addEventListener('resize', onResize)

      const shapes = root.current?.querySelectorAll<SVGGeometryElement>('.intro-logo__shape')
      if (!root.current || !shapes?.length) throw new Error('Intro logo unavailable')
      gsap.set(shapes, { drawSVG: '0%' })
      // One timeline is available for inspection even while the assets are decoding.
      master = gsap.timeline({ paused: true, onComplete: () => finish() })
      introWindow.introTl = master

      const decodeImage = async (image: HTMLImageElement) => {
        let lastError: unknown
        for (let attempt = 0; attempt < 3; attempt++) {
          const selected = image.currentSrc
          try {
            await image.decode()
            await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
            if (image.complete && image.naturalWidth > 0 && (!selected || selected === image.currentSrc)) return
          } catch (error) { lastError = error }
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
        }
        throw lastError || new Error('Hero image did not settle')
      }

      preloadTimer = window.setTimeout(failOpen, INTRO_CONFIG.duration.preloadTimeout)
      const heroImages = [...document.querySelectorAll<HTMLImageElement>('.hero__artwork img')]
      Promise.all([document.fonts.ready, ...heroImages.map(decodeImage)])
        .then(() => {
          if (!active || complete || !master || !root.current) return
          window.clearTimeout(preloadTimer)
          // All geometry is measured after the final responsive sources and fonts settle.
          context.add(() => {
            try {
              const overlay = root.current!
              const timeline = master!
              const mobile = window.matchMedia('(max-width: 760px)').matches
              const timing = mobile ? INTRO_CONFIG.mobile : INTRO_CONFIG.desktop
              const crystal = setupCrystalTransition(overlay, mobile)
              releaseScene = () => crystal.cleanup()
              const scene = setupHeroReveal(mobile)
              releaseScene = () => { crystal.cleanup(); scene.cleanup() }
              const phase = (name: string) => () => overlay.setAttribute('data-intro-phase', name)
              timeline.addLabel('outline', 0)
                .call(phase('outline'), [], 'outline')
                .to(shapes, {
                  drawSVG: '100%',
                  duration: timing.outline - INTRO_CONFIG.duration.stagger * (shapes.length - 1),
                  stagger: INTRO_CONFIG.duration.stagger, ease: INTRO_CONFIG.ease.outline,
                }, 'outline')
                .addLabel('hold', timing.outline)
                .addLabel('glass', timing.glass)
                .call(phase('glass'), [], 'glass')
              addGlassPhase(timeline, overlay, timing.glass, timing.shatter - timing.glass)
              timeline.addLabel('shatter', timing.shatter)
                .call(() => { html.classList.add('intro-revealing'); phase('shatter')() }, [], 'shatter')
              crystal.addTo(timeline, timing.shatter, timing.handoff)
              timeline.addLabel('hero', timing.hero).call(phase('hero'), [], 'hero')
              scene.addTo(timeline, timing.hero, timing.shatter)
              timeline.addLabel('exit', timing.exit)
                .call(phase('exit'), [], 'exit')
                .to(overlay, { opacity: 0, duration: INTRO_CONFIG.duration.exit, ease: INTRO_CONFIG.ease.exit }, 'exit')
              playingSize = { width: window.innerWidth, height: window.innerHeight }
              timeline.play(0)
            } catch { failOpen() }
          })
        })
        .catch(failOpen)
    } catch { failOpen() }
    return cleanup
  }, { scope: root })

  if (!visible) return null

  return (
    <div id="preloader" data-intro-phase="preloading" className="intro-preloader" ref={root} role="status" aria-label="جارٍ تجهيز التجربة">
      <div className="intro-preloader__tiles" aria-hidden="true" />
      <div className="intro-preloader__shockwave" aria-hidden="true" />
      <div className="intro-preloader__flash" aria-hidden="true" />
      <svg className="intro-logo" viewBox="0 0 372.19 107.26" aria-hidden="true" fill="none" stroke={INTRO_CONFIG.color.lime} strokeWidth="1.4" strokeLinejoin="round">
        <defs>
          <linearGradient id="intro-glass-fill" x1="0" y1="1" x2="0.8" y2="0">
            <stop offset="0" stopColor="#0b3bff" />
            <stop offset="0.6" stopColor="#2d8cff" />
            <stop offset="0.83" stopColor="#8bdcff" />
            <stop offset="1" stopColor="#1955ff" />
          </linearGradient>
          <linearGradient id="intro-glass-sweep">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.8" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <clipPath id="intro-logo-clip">
        <path fill="white" stroke="none" d="M172.2,69.83c-4.83,8.35-13.87,13.98-24.21,13.98-15.44,0-27.96-12.51-27.96-27.96s12.51-27.95,27.96-27.95c10.12,0,18.98,5.38,23.89,13.43l-10.07,5.91c-2.87-4.61-7.99-7.67-13.82-7.67-9,0-16.29,7.29-16.29,16.28s7.29,16.28,16.29,16.28c6.06,0,11.35-3.31,14.14-8.22l10.07,5.91Z"/>
        <path fill="white" stroke="none" d="M344.24,27.91c-15.44,0-27.95,12.51-27.95,27.95s12.51,27.96,27.95,27.96,27.95-12.51,27.95-27.96-12.51-27.95-27.95-27.95ZM344.24,72.14c-9,0-16.28-7.29-16.28-16.28s7.29-16.28,16.28-16.28,16.28,7.29,16.28,16.28-7.29,16.28-16.28,16.28Z"/>
        <path fill="white" stroke="none" d="M246.97,59.71c.17-1.26.27-2.54.27-3.85,0-15.43-12.51-27.95-27.96-27.95s-27.95,12.51-27.95,27.95,12.51,27.96,27.95,27.96c10.08,0,18.91-5.33,23.84-13.33l-10.41-5.4c-2.93,4.26-7.85,7.06-13.42,7.06-7.67,0-14.1-5.3-15.82-12.43h43.51ZM203.64,51.29c1.97-6.77,8.22-11.71,15.63-11.71s13.66,4.94,15.63,11.71h-31.26Z"/>
        <rect fill="white" stroke="none" x="174.76" y="8.42" width="12.59" height="73.66"/>
        <path fill="white" stroke="none" d="M311.16,25.53v7.87c-2.37.04-6.1.43-9.94,2.55-4.85,2.68-8.58,7.18-11.26,11.95-3.83,6.82-7.16,13.91-11,20.72-3.3,5.86-7.16,12.09-13.88,14.38-1.28.44-2.48.68-3.5.82l-20.45-53.78h13.06l14.38,37.82c1.57-1.91,3.16-4.14,4.62-6.73,7.25-12.77,11.49-32.33,28.38-35.6,4.02-.78,7.43-.41,9.57,0Z"/>
        <path fill="white" stroke="none" d="M311.16,36.69v47.12h-12.46v-35.16c0-4.47,2.38-8.67,6.29-10.62.21-.1.42-.2.63-.29,2.22-.96,4.25-1.09,5.53-1.05Z"/>
        <path fill="white" stroke="none" d="M313.4,13.65c0,4.06-3.29,7.35-7.35,7.35s-7.35-3.29-7.35-7.35,3.29-7.35,7.35-7.35,7.35,3.29,7.35,7.35Z"/>
        <path fill="white" stroke="none" d="M100.12,31.94c-.82,12.42-14.59,16.62-24.83,12.55-8.64-3.43-14.43-11.81-21.36-17.62-1.57-1.32-3.22-2.55-4.99-3.59-1.29-.76-2.64-1.41-4.05-1.92-.41-.15-.82-.28-1.23-.41-6.78-2.06-12.58-.81-14.93-.26-9.74,2.24-15.59,8.55-18.09,11.33C1.76,41.86.42,53.35.14,57.58c-.09-1.3-.14-2.62-.14-3.95C0,24.01,24.01,0,53.63,0c7.47,0,14.91,1.56,21.74,4.59,4.91,2.18,9.67,5.16,13.83,8.68,4.1,3.47,8.68,7.72,10.28,13.01.55,1.82.77,3.76.64,5.66Z"/>
        <path fill="white" stroke="none" d="M102.36,76.26c-2.21,5.78-6.31,11.01-10.58,15.17-2.54,2.48-5.31,4.73-8.25,6.72-8.52,5.75-18.64,8.92-28.91,9.1-.33,0-.66,0-1,0-23.94,0-44.22-15.69-51.11-37.35,1.63,3.41,4.19,7.75,8.17,12.06,1.47,1.59,8.61,9.11,20.55,13.26,15.67,5.45,29.52,1.62,34.43,0-2.66-.44-6.33-1.16-10.63-2.37-6.11-1.72-11.45-3.22-17.3-6.76-3.93-2.38-11.26-6.95-15.37-15.72-1.14-2.42-2.76-6.01-2.37-10.8.11-1.41.53-5.78,3.86-9.83,5.44-6.62,15.41-8.06,22.95-4.43,6.76,3.26,12.01,8.92,18.74,12.23,3.26,1.6,6.81,2.51,10.46,2.22,6.41-.52,12.5-4.23,18.97-3.71,7.25.59,9.64,7.57,8.94,13.92-.24,2.15-.78,4.26-1.56,6.3Z"/>
          </clipPath>
        </defs>
        <g id="intro-logo-shapes">
        <path className="intro-logo__shape" d="M172.2,69.83c-4.83,8.35-13.87,13.98-24.21,13.98-15.44,0-27.96-12.51-27.96-27.96s12.51-27.95,27.96-27.95c10.12,0,18.98,5.38,23.89,13.43l-10.07,5.91c-2.87-4.61-7.99-7.67-13.82-7.67-9,0-16.29,7.29-16.29,16.28s7.29,16.28,16.29,16.28c6.06,0,11.35-3.31,14.14-8.22l10.07,5.91Z"/>
        <path className="intro-logo__shape" d="M344.24,27.91c-15.44,0-27.95,12.51-27.95,27.95s12.51,27.96,27.95,27.96,27.95-12.51,27.95-27.96-12.51-27.95-27.95-27.95ZM344.24,72.14c-9,0-16.28-7.29-16.28-16.28s7.29-16.28,16.28-16.28,16.28,7.29,16.28,16.28-7.29,16.28-16.28,16.28Z"/>
        <path className="intro-logo__shape" d="M246.97,59.71c.17-1.26.27-2.54.27-3.85,0-15.43-12.51-27.95-27.96-27.95s-27.95,12.51-27.95,27.95,12.51,27.96,27.95,27.96c10.08,0,18.91-5.33,23.84-13.33l-10.41-5.4c-2.93,4.26-7.85,7.06-13.42,7.06-7.67,0-14.1-5.3-15.82-12.43h43.51ZM203.64,51.29c1.97-6.77,8.22-11.71,15.63-11.71s13.66,4.94,15.63,11.71h-31.26Z"/>
        <rect className="intro-logo__shape" x="174.76" y="8.42" width="12.59" height="73.66"/>
        <path className="intro-logo__shape" d="M311.16,25.53v7.87c-2.37.04-6.1.43-9.94,2.55-4.85,2.68-8.58,7.18-11.26,11.95-3.83,6.82-7.16,13.91-11,20.72-3.3,5.86-7.16,12.09-13.88,14.38-1.28.44-2.48.68-3.5.82l-20.45-53.78h13.06l14.38,37.82c1.57-1.91,3.16-4.14,4.62-6.73,7.25-12.77,11.49-32.33,28.38-35.6,4.02-.78,7.43-.41,9.57,0Z"/>
        <path className="intro-logo__shape" d="M311.16,36.69v47.12h-12.46v-35.16c0-4.47,2.38-8.67,6.29-10.62.21-.1.42-.2.63-.29,2.22-.96,4.25-1.09,5.53-1.05Z"/>
        <path className="intro-logo__shape" d="M313.4,13.65c0,4.06-3.29,7.35-7.35,7.35s-7.35-3.29-7.35-7.35,3.29-7.35,7.35-7.35,7.35,3.29,7.35,7.35Z"/>
        <path className="intro-logo__shape" d="M100.12,31.94c-.82,12.42-14.59,16.62-24.83,12.55-8.64-3.43-14.43-11.81-21.36-17.62-1.57-1.32-3.22-2.55-4.99-3.59-1.29-.76-2.64-1.41-4.05-1.92-.41-.15-.82-.28-1.23-.41-6.78-2.06-12.58-.81-14.93-.26-9.74,2.24-15.59,8.55-18.09,11.33C1.76,41.86.42,53.35.14,57.58c-.09-1.3-.14-2.62-.14-3.95C0,24.01,24.01,0,53.63,0c7.47,0,14.91,1.56,21.74,4.59,4.91,2.18,9.67,5.16,13.83,8.68,4.1,3.47,8.68,7.72,10.28,13.01.55,1.82.77,3.76.64,5.66Z"/>
        <path className="intro-logo__shape" d="M102.36,76.26c-2.21,5.78-6.31,11.01-10.58,15.17-2.54,2.48-5.31,4.73-8.25,6.72-8.52,5.75-18.64,8.92-28.91,9.1-.33,0-.66,0-1,0-23.94,0-44.22-15.69-51.11-37.35,1.63,3.41,4.19,7.75,8.17,12.06,1.47,1.59,8.61,9.11,20.55,13.26,15.67,5.45,29.52,1.62,34.43,0-2.66-.44-6.33-1.16-10.63-2.37-6.11-1.72-11.45-3.22-17.3-6.76-3.93-2.38-11.26-6.95-15.37-15.72-1.14-2.42-2.76-6.01-2.37-10.8.11-1.41.53-5.78,3.86-9.83,5.44-6.62,15.41-8.06,22.95-4.43,6.76,3.26,12.01,8.92,18.74,12.23,3.26,1.6,6.81,2.51,10.46,2.22,6.41-.52,12.5-4.23,18.97-3.71,7.25.59,9.64,7.57,8.94,13.92-.24,2.15-.78,4.26-1.56,6.3Z"/>
        </g>
        <g clipPath="url(#intro-logo-clip)">
          <rect className="intro-logo__sweep" x="-110" y="-35" width="90" height="180" fill="url(#intro-glass-sweep)" />
        </g>
      </svg>
    </div>
  )
}
