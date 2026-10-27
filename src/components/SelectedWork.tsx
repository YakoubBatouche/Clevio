import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpLeft, X } from 'lucide-react'

type Project = {
  id: string
  title: string
  category: string
  description: string
  image: string
  alt: string
  brief: string
  scope: string[]
}

const projects: Project[] = [
  {
    id: 'identity',
    title: 'هوية بصرية متكاملة',
    category: 'هوية بصرية',
    description: 'حضور مميز يعبّر عن جوهر العلامة.',
    image: 'brand-identity.webp',
    alt: 'تصوّر لهوية بصرية وتغليف فاخر بدرجات البنفسجي والفضي',
    brief: 'تصوّر إبداعي لهوية تجمع بين بساطة الفكرة ودقة التفاصيل. تمتد اللغة البصرية من الرمز إلى الألوان والخامات، لتصنع حضورًا متناسقًا في كل نقطة تواصل.',
    scope: ['مفهوم الهوية', 'نظام الألوان والخطوط', 'تصميم التغليف', 'تطبيقات العلامة'],
  },
  {
    id: 'digital',
    title: 'تجربة رقمية تفاعلية',
    category: 'تصميم وتطوير',
    description: 'تجارب سهلة، مصممة لتترك أثرًا.',
    image: 'digital-experience.webp',
    alt: 'تصوّر موقع رقمي على حاسوب محمول بألوان زرقاء داكنة وعناصر زجاجية',
    brief: 'تصوّر لتجربة رقمية توازن بين شخصية العلامة وسهولة الاستخدام. واجهة واضحة، محتوى منظم وتفاصيل بصرية تمنح الفكرة مساحة للتألق على مختلف الشاشات.',
    scope: ['تصميم تجربة المستخدم', 'تصميم الواجهات', 'التطوير المتجاوب', 'تفاصيل التفاعل'],
  },
  {
    id: 'visual',
    title: 'قصة تُروى بالصورة',
    category: 'إنتاج مرئي',
    description: 'محتوى يحوّل الرسالة إلى تجربة.',
    image: 'visual-story.webp',
    alt: 'كاميرا سينمائية احترافية بإضاءة زرقاء ولمسات كهرمانية داخل استوديو',
    brief: 'تصوّر بصري لأسلوب إنتاج يمنح الرسالة إيقاعها وصورتها. من بناء الفكرة إلى اختيار الإضاءة والمشهد، تعمل التفاصيل معًا لصنع قصة واضحة ومؤثرة.',
    scope: ['الفكرة والاتجاه الفني', 'التخطيط البصري', 'التصوير والإضاءة', 'المونتاج والمعالجة'],
  },
]

const workImage = (name: string) => import.meta.env.BASE_URL + 'work/' + name

export function SelectedWork({ onStartProject }: { onStartProject: () => void }) {
  const [selected, setSelected] = useState<Project | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !selected) return
    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [selected])

  function closeProject() {
    dialogRef.current?.close()
    setSelected(null)
    triggerRef.current?.focus()
  }

  return (
    <section id="work" className="selected-work" aria-labelledby="selected-work-heading" tabIndex={-1}>
      <div className="selected-work__shell">
        <div className="selected-work__header">
          <div>
            <p className="selected-work__eyebrow">من الفكرة إلى الأثر</p>
            <h2 id="selected-work-heading">أعمال مختارة</h2>
          </div>
          <button className="selected-work__next" type="button" onClick={onStartProject}>
            <span>لنصنع عملك القادم</span>
            <ArrowLeft aria-hidden="true" />
          </button>
        </div>

        <div className="selected-work__grid">
          {projects.map((project, index) => (
            <button
              className={'work-card' + (index === 0 ? ' work-card--featured' : '')}
              type="button"
              key={project.id}
              onClick={(event) => {
                triggerRef.current = event.currentTarget
                setSelected(project)
              }}
            >
              <img src={workImage(project.image)} alt="" loading="lazy" decoding="async"
                width={index === 0 ? 1122 : 1672} height={index === 0 ? 1402 : 941} />
              <span className="work-card__shade" aria-hidden="true" />
              <span className="work-card__badge">{project.category}</span>
              <span className="work-card__copy">
                <strong>{project.title}</strong>
                <span>{project.description}</span>
              </span>
              <span className="work-card__arrow" aria-hidden="true"><ArrowUpLeft strokeWidth={1.6} /></span>
            </button>
          ))}
        </div>
        <p className="selected-work__note">نماذج بصرية توضيحية</p>
      </div>

      <dialog ref={dialogRef} className="work-dialog" aria-labelledby="work-dialog-title"
        onCancel={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closeProject() }}>
        {selected && <div className="work-dialog__inner">
          <button className="work-dialog__close" type="button" aria-label="إغلاق تفاصيل العمل" onClick={closeProject}>
            <X aria-hidden="true" />
          </button>
          <div className="work-dialog__visual">
            <img src={workImage(selected.image)} alt={selected.alt} />
          </div>
          <div className="work-dialog__body">
            <p className="work-dialog__category">{selected.category} <span>· تصوّر إبداعي</span></p>
            <h2 id="work-dialog-title">{selected.title}</h2>
            <p className="work-dialog__brief">{selected.brief}</p>
            <h3>ما الذي تصنعه الفكرة؟</h3>
            <ul>{selected.scope.map((item) => <li key={item}>{item}</li>)}</ul>
            <button className="work-dialog__cta" type="button" onClick={() => {
              closeProject()
              onStartProject()
            }}>
              <span>لنتحدث عن مشروعك</span><ArrowLeft aria-hidden="true" />
            </button>
          </div>
        </div>}
      </dialog>
    </section>
  )
}
