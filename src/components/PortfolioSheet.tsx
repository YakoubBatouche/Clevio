import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { portfolioCategories } from '../content/portfolio'

const allFilter = { id: 'all', label: 'الكل' }

export function PortfolioSheet({ category, trigger, onClose }: {
  category: string | null
  trigger?: HTMLButtonElement | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const backdropPressed = useRef(false)
  const requested = portfolioCategories.find((entry) => entry.id === category)
  const [selection, setSelection] = useState({
    requested,
    displayed: requested,
    filterId: allFilter.id,
  })

  if (selection.requested !== requested) {
    // Preserve the visible gallery while the dialog animates out of the top layer.
    setSelection({
      requested,
      displayed: requested ?? selection.displayed,
      filterId: requested ? allFilter.id : selection.filterId,
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
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected && document.activeElement !== returnFocus) {
        returnFocus.focus({ preventScroll: true })
      }
    }
  }, [requested, trigger])

  const { displayed, filterId } = selection
  const items = displayed?.items.filter((item) => filterId === allFilter.id || item.filterId === filterId) ?? []

  return createPortal(
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
            <div className="portfolio-sheet__grip" aria-hidden="true" />
            <header className="portfolio-sheet__header">
              <div>
                <p className="portfolio-sheet__eyebrow">معرض الأعمال</p>
                <h2 id="portfolio-sheet-title" className="portfolio-sheet__title">{displayed.title}</h2>
                <p className="portfolio-sheet__description">نماذج بصرية توضيحية</p>
              </div>
              <button className="portfolio-sheet__close" type="button" aria-label="إغلاق معرض الأعمال" autoFocus onClick={onClose}>
                <X aria-hidden="true" />
              </button>
            </header>
            <div ref={filtersRef} className="portfolio-sheet__filters" role="group" aria-label="تصفية الأعمال">
              {[allFilter, ...displayed.filters].map((filter) => (
                <button
                  key={filter.id}
                  className="portfolio-sheet__filter"
                  type="button"
                  aria-controls="portfolio-sheet-gallery"
                  aria-pressed={filterId === filter.id}
                  onClick={() => {
                    if (filter.id === filterId) return
                    setSelection({ ...selection, filterId: filter.id })
                    scrollRef.current?.scrollTo(0, 0)
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={scrollRef}
            id="portfolio-sheet-gallery"
            className="portfolio-sheet__scroll"
            data-native-scroll
            role="region"
            aria-label="نماذج الأعمال"
            tabIndex={0}
          >
            {items.length ? (
              <ul className="portfolio-sheet__grid" role="list">
                {items.map((item) => (
                  <li key={item.id} className="portfolio-sheet__card">
                    <div className="portfolio-sheet__media">
                      <img
                        src={import.meta.env.BASE_URL + item.image}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        style={item.position ? { objectPosition: item.position } : undefined}
                      />
                    </div>
                    <div className="portfolio-sheet__card-body">
                      <h3 className="portfolio-sheet__card-title">{item.title}</h3>
                      <p className="portfolio-sheet__card-meta">{displayed.filters.find((filter) => filter.id === item.filterId)?.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portfolio-sheet__empty">لا توجد أعمال في هذا التصنيف حاليًا.</p>
            )}
          </div>
        </div>
      )}
    </dialog>,
    document.body,
  )
}
