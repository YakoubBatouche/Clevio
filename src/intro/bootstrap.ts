type IntroBootWindow = Window & { __clevioIntroBoot?: { skip: boolean; watchdog: number } }

export function prepareIntro() {
  const root = document.documentElement
  const bootWindow = window as IntroBootWindow
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
  }, 15_000)
  bootWindow.__clevioIntroBoot = { skip, watchdog }
}
