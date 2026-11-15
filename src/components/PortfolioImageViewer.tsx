import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { portfolioContent, type PortfolioItem } from '../content/portfolio'
import { siteImageUrl } from '../content/site'

export type PortfolioImageSelection = {
  item: PortfolioItem
  video?: string
  format?: 'reel'
  trigger: HTMLButtonElement
}

export function PortfolioImageViewer({ item, video, format, trigger, onClose }: PortfolioImageSelection & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPressed = useRef(false)
  const poster = item.image?.trim()
  const image = poster ? siteImageUrl(poster) : undefined

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
      data-format={format}
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
        <button className="portfolio-image-viewer__close" type="button" aria-label={video ? 'إغلاق الفيديو' : portfolioContent.closeImageLabel} autoFocus onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="portfolio-image-viewer__art">
        {video ? (
          <video
            className="portfolio-image-viewer__image"
            src={video}
            poster={image}
            aria-label={item.title}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <img className="portfolio-image-viewer__image" src={image} alt={item.alt ?? ''} decoding="async" />
        )}
      </div>
    </dialog>,
    document.body,
  )
}
