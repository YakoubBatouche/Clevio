import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, X } from 'lucide-react'
import { portfolioCategories, portfolioContent } from '../content/portfolio'
import { siteImageUrl } from '../content/site'
import { PortfolioImageViewer, type PortfolioImageSelection } from './PortfolioImageViewer'

const allFilter = { id: 'all', label: portfolioContent.allFilterLabel }
const gripClickSlop = 6

type GripDrag = {
  pointerId: number
  handle: HTMLButtonElement
  startX: number
  startY: number
  moved: boolean
}

export function PortfolioSheet({ category, trigger, onClose }: {
  category: string | null
  trigger?: HTMLButtonElement | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const backdropPressed = useRef(false)
  const gripDrag = useRef<GripDrag | null>(null)
  const suppressGripClick = useRef(false)
  const [viewer, setViewer] = useState<PortfolioImageSelection | null>(null)
  const requested = portfolioCategories.find((entry) => entry.id === category)
  const [selection, setSelection] = useState({
    requested,
    displayed: requested,
    filterId: allFilter.id,
    filterMotion: false,
  })

  if (selection.requested !== requested) {
    if (viewer) setViewer(null)
    // Preserve the visible gallery while the dialog animates out of the top layer.
    setSelection({
      requested,
      displayed: requested ?? selection.displayed,
      filterId: requested ? allFilter.id : selection.filterId,
      filterMotion: !requested && selection.filterMotion,
    })
  }

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !requested) return

    const returnFocus = trigger ?? document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    filtersRef.current?.scrollTo(0, 0)
    scrollRef.current?.scrollTo(0, 0)

    return () => {
      const drag = gripDrag.current
      gripDrag.current = null
      if (drag) {
        suppressGripClick.current = true
        if (drag.handle.hasPointerCapture(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId)
      }
      dialog.removeAttribute('data-dragging')
      if (dialog.open) dialog.close()
      dialog.style.removeProperty('--sheet-drag-y')
      document.body.style.overflow = previousOverflow
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected && document.activeElement !== returnFocus) {
        returnFocus.focus({ preventScroll: true })
      }
    }
  }, [requested, trigger])

  function startGripDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || gripDrag.current) return

    suppressGripClick.current = false
    gripDrag.current = {
      pointerId: event.pointerId,
      handle: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveGripDrag(event: PointerEvent<HTMLButtonElement>) {
    const dialog = dialogRef.current
    const drag = gripDrag.current
    if (!dialog || !drag || drag.pointerId !== event.pointerId) return

    const offset = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, offset) <= gripClickSlop) return

    drag.moved = true
    dialog.setAttribute('data-dragging', '')
    dialog.style.setProperty('--sheet-drag-y', `${Math.max(0, offset)}px`)
  }

  function endGripDrag(event: PointerEvent<HTMLButtonElement>, canceled = false) {
    const dialog = dialogRef.current
    const drag = gripDrag.current
    if (!dialog || !drag || drag.pointerId !== event.pointerId) return

    const offset = event.clientY - drag.startY
    gripDrag.current = null
    suppressGripClick.current = canceled || drag.moved || Math.hypot(event.clientX - drag.startX, offset) > gripClickSlop
    dialog.removeAttribute('data-dragging')

    const dismissDistance = Math.max(72, Math.min(120, dialog.offsetHeight * 0.2))
    if (!canceled && offset >= dismissDistance) {
      onClose()
    } else {
      dialog.style.removeProperty('--sheet-drag-y')
    }
  }

  const { displayed, filterId, filterMotion } = selection
  const selectedFilter = displayed?.filters.find((filter) => filter.id === filterId)
  const items = displayed?.items.filter((item) => filterId === allFilter.id || item.filterId === filterId) ?? []

  const sheet = createPortal(
    <dialog
      ref={dialogRef}
      id="portfolio-sheet"
      className="portfolio-sheet"
      dir="rtl"
      aria-labelledby="portfolio-sheet-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={(event) => {
        if (!event.currentTarget.open && requested) onClose()
      }}
      onPointerDown={(event) => {
        backdropPressed.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (backdropPressed.current && event.target === event.currentTarget) onClose()
        backdropPressed.current = false
      }}
    >
      {displayed && (
        <div className="portfolio-sheet__panel">
          <div className="portfolio-sheet__chrome">
            <button
              className="portfolio-sheet__grip"
              type="button"
              aria-label={portfolioContent.gripLabel}
              onPointerDown={startGripDrag}
              onPointerMove={moveGripDrag}
              onPointerUp={endGripDrag}
              onPointerCancel={(event) => endGripDrag(event, true)}
              onLostPointerCapture={(event) => endGripDrag(event, true)}
              onClick={(event) => {
                if (event.detail === 0 || !suppressGripClick.current) onClose()
              }}
            />
            <header className="portfolio-sheet__header">
              <div className="portfolio-sheet__heading">
                <h2 id="portfolio-sheet-title" className="portfolio-sheet__title">{displayed.title}</h2>
                <div className="portfolio-sheet__summary">
                  <p className="portfolio-sheet__description">{displayed.description}</p>
                  {portfolioContent.sheetNote && <p className="portfolio-sheet__eyebrow">{portfolioContent.sheetNote}</p>}
                </div>
              </div>
              <button className="portfolio-sheet__close" type="button" aria-label={portfolioContent.closeLabel} autoFocus onClick={onClose}>
                <X aria-hidden="true" />
              </button>
            </header>
            {displayed.filters.length > 0 && (
              <div ref={filtersRef} className="portfolio-sheet__filters" data-native-scroll="horizontal" role="group" aria-label={portfolioContent.filtersLabel}>
                {[allFilter, ...displayed.filters].map((filter) => (
                  <button
                    key={filter.id}
                    className="portfolio-sheet__filter"
                    type="button"
                    aria-controls="portfolio-sheet-gallery"
                    aria-pressed={filterId === filter.id}
                    onClick={() => {
                      if (filter.id === filterId) return
                      setSelection({ ...selection, filterId: filter.id, filterMotion: true })
                      scrollRef.current?.scrollTo(0, 0)
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            ref={scrollRef}
            id="portfolio-sheet-gallery"
            className="portfolio-sheet__scroll"
            data-native-scroll
            role="region"
            aria-label={portfolioContent.galleryLabel}
            aria-describedby={selectedFilter ? 'portfolio-sheet-filter-description' : undefined}
            tabIndex={0}
          >
            {selectedFilter && (
              <p id="portfolio-sheet-filter-description" className="portfolio-sheet__filter-description">
                {selectedFilter.description}
              </p>
            )}
            {items.length ? (
              <ul key={filterId} className="portfolio-sheet__grid" role="list" data-filter-motion={filterMotion || undefined}>
                {items.map((item, index) => {
                  const filterLabel = displayed.filters.find((filter) => filter.id === item.filterId)?.label

                  return (
                    <li key={item.id ?? index} className="portfolio-sheet__card">
                      <button className="portfolio-sheet__media" type="button" aria-haspopup="dialog"
                        aria-label={portfolioContent.previewLabel + ': ' + item.title} onClick={(event) => setViewer({ item, trigger: event.currentTarget })}>
                        <img
                          src={siteImageUrl(item.image)}
                          alt={item.alt}
                          loading="lazy"
                          decoding="async"
                          style={item.position ? { objectPosition: item.position } : undefined}
                        />
                        <span className="portfolio-sheet__zoom" aria-hidden="true"><Maximize2 /></span>
                      </button>
                      <div className="portfolio-sheet__card-body">
                        <h3 className="portfolio-sheet__card-title">{item.title}</h3>
                        {filterLabel && <p className="portfolio-sheet__card-meta">{filterLabel}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p key={filterId} className="portfolio-sheet__empty" data-filter-motion={filterMotion || undefined}>{portfolioContent.emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </dialog>,
    document.body,
  )

  return <>
    {sheet}
    {viewer && <PortfolioImageViewer {...viewer} onClose={() => setViewer(null)} />}
  </>
}
