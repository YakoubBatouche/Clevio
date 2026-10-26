const partnerMarks = [
  <g key="orbit-petals" fill="none" stroke="currentColor" strokeWidth="2.4">
    <ellipse cx="48" cy="48" rx="14" ry="31" transform="rotate(45 48 48)" />
    <ellipse cx="48" cy="48" rx="14" ry="31" transform="rotate(-45 48 48)" />
    <circle cx="48" cy="48" r="9" fill="currentColor" stroke="none" />
  </g>,
  <g key="bloom" fill="none" stroke="currentColor" strokeWidth="2.5">
    {[0, 60, 120, 180, 240, 300].map((angle) => <ellipse key={angle} cx="48" cy="29" rx="7" ry="14" transform={'rotate(' + angle + ' 48 48)'} />)}
    <circle cx="48" cy="48" r="5" fill="currentColor" stroke="none" />
  </g>,
  <g key="gem" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <path d="M17 38 33 21h30l16 17-31 37Z" />
    <path d="m17 38 31 37 15-54M33 21l15 54M17 38h62M33 21l15 17 15-17" />
  </g>,
  <g key="fold" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
    <path d="m28 16 33 32-33 32M42 16l33 32-33 32M28 33l16 15-16 15" />
  </g>,
  <g key="link" fill="none" stroke="currentColor" strokeWidth="3">
    <ellipse cx="38" cy="48" rx="21" ry="28" transform="rotate(32 38 48)" />
    <ellipse cx="58" cy="48" rx="21" ry="28" transform="rotate(32 58 48)" />
  </g>,
  <g key="ribbon" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
    <path d="m19 23 18 51 11-34 11 34 18-51-18 12-11-12-11 12Z" />
    <path d="m19 23 18 12v39M77 23 59 35v39M37 35l11 5 11-5" />
  </g>,
  <g key="spark" fill="currentColor">
    <path d="m48 14 18 21 18 13-18 13-18 21-18-21-18-13 18-13Zm0 18L28 48l20 16 20-16Z" fillRule="evenodd" />
  </g>,
  <g key="contour" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <path d="m48 15 33 33-33 33-33-33Z" />
    <path d="m48 27 21 21-21 21-21-21Z" />
    <path d="m48 39 9 9-9 9-9-9Z" />
  </g>,
]

export function Partners() {
  return (
    <section id="partners" className="partners" aria-labelledby="partners-heading" aria-describedby="partners-note">
      <div className="partners__inner">
        <div className="partners__header">
          <h2 id="partners-heading" className="partners__heading">شركاء صنعنا معهم الفرق</h2>
          <p id="partners-note" className="partners__note">نماذج لشعارات توضيحية</p>
        </div>
        <div className="partners__marks" aria-hidden="true">
          {partnerMarks.map((mark, index) => (
            <span key={index} className="partners__mark">
              <svg viewBox="0 0 96 96" focusable="false" aria-hidden="true">{mark}</svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
