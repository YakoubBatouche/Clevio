export function Brand({ vector = false }: { vector?: boolean }) {
  return (
    <a className="brand" href="#home" aria-label="Clevio — الرئيسية">
      {vector ? (
        <img src={import.meta.env.BASE_URL + 'images/clevio-logo.svg'} width="372.19" height="107.26" alt="" />
      ) : (
        <svg viewBox="84 39 176 48" aria-hidden="true" focusable="false">
          <image href={import.meta.env.BASE_URL + 'images/hero-approved.webp'} width="1672" height="941" />
        </svg>
      )}
    </a>
  )
}
