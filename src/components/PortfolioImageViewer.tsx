import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { portfolioContent } from '../content/portfolio'
import { siteImageUrl } from '../content/site'

export type PortfolioImageSelection = {
  item: { title: string; image: string; alt: string }
  trigger: HTMLButtonElement
}

export function PortfolioImageViewer({ item, trigger, onClose }: PortfolioImageSelection & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPressed = useRef(false)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
      if (trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [trigger])

  return createPortal(
    <dialog
      ref={dialogRef}
      className="portfolio-image-viewer"
      dir="rtl"
      aria-labelledby="portfolio-image-viewer-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        backdropPressed.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (backdropPressed.current && event.target === event.currentTarget) onClose()
        backdropPressed.current = false
      }}
    >
      <div className="portfolio-image-viewer__bar">
        <h2 id="portfolio-image-viewer-title">{item.title}</h2>
        <button className="portfolio-image-viewer__close" type="button" aria-label={portfolioContent.closeImageLabel} autoFocus onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="portfolio-image-viewer__art">
        <img className="portfolio-image-viewer__image" src={siteImageUrl(item.image)} alt={item.alt} decoding="async" />
      </div>
    </dialog>,
    document.body,
  )
}
