type IntroBootWindow = Window & {
  __clevioIntroBoot?: { skip: boolean; watchdog: number }
  __clevioReloadPrepared?: boolean
}

function prepareReload(bootWindow: IntroBootWindow) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (bootWindow.__clevioReloadPrepared || navigation?.type !== 'reload') return
  // Keep this document-level reset one-time, including during development hot reloads.
  bootWindow.__clevioReloadPrepared = true
  const previousRestoration = window.history.scrollRestoration
  window.history.scrollRestoration = 'manual'
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#home`)
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

  // Native reload restoration finishes around pageshow. Only release its lock later;
  // a delayed scroll could override a visitor's first navigation or scroll gesture.
  const restore = () => { window.history.scrollRestoration = previousRestoration }
  const onPageShow = () => { window.requestAnimationFrame(restore) }
  if (document.readyState === 'complete') onPageShow()
  else window.addEventListener('pageshow', onPageShow, { once: true })
}

export function prepareIntro() {
  const root = document.documentElement
  const bootWindow = window as IntroBootWindow
  prepareReload(bootWindow)
  window.clearTimeout(bootWindow.__clevioIntroBoot?.watchdog)
  root.classList.add('js')
  root.classList.remove('intro-failed', 'intro-revealing')
  const skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (import.meta.env.DEV && new URLSearchParams(window.location.search).has('skipintro'))
  const previousOverflow = document.body.style.overflow
  if (!skip) root.classList.add('intro-pending')
  else root.classList.remove('intro-pending')
  const watchdog = skip ? 0 : window.setTimeout(() => {
    root.classList.remove('intro-pending', 'intro-revealing')
    root.classList.add('intro-failed')
    document.body.style.overflow = previousOverflow
    document.querySelectorAll('.site-header, #main-content, .site-footer, .skip-link').forEach((element) => element.removeAttribute('inert'))
    window.dispatchEvent(new Event('clevio:intro-abort'))
  }, 25_000)
  bootWindow.__clevioIntroBoot = { skip, watchdog }
}
