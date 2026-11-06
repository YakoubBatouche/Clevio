/* global window */
(() => {
  const cms = window.CMS
  if (!cms) return

  const h = cms.React.createElement
  const start = '#/pages/start'
  const entry = (collection, file) => `#/collections/${collection}/entries/${file}`

  const tasks = [
    {
      title: 'تعديل الصفحة الرئيسية',
      text: 'حدّث العناوين والنصوص والشعار والشركاء ومعلومات التواصل.',
      link: 'افتح محتوى الصفحة',
      href: entry('homepage', 'site'),
      icon: ['M4 5h16v14H4z', 'M4 9h16', 'M8 13h5', 'M8 16h8'],
    },
    {
      title: 'تحديث الخدمات',
      text: 'غيّر أسماء بطاقات الخدمات وعدّل ما نقدّمه داخل كل بطاقة.',
      link: 'افتح بطاقات الخدمات',
      href: entry('services', 'catalog'),
      icon: ['M5 5h5v5H5z', 'M14 5h5v5h-5z', 'M5 14h5v5H5z', 'M14 14h5v5h-5z'],
    },
    {
      title: 'إدارة صور الأعمال',
      text: 'اختر معرضًا لإضافة صور جديدة أو إعادة ترتيب الأعمال أو إزالتها.',
      link: 'اعرض كل المعارض',
      href: '#/collections/galleries',
      icon: ['M4 5h16v14H4z', 'M4 17l5-5 3 3 3-3 5 5', 'M15 9h.01'],
    },
  ]

  const galleries = [
    ['print', 'المطبوعات'],
    ['logos', 'الشعارات'],
    ['digital-marketing', 'التسويق الرقمي والنمو'],
    ['web-app', 'المواقع والتطبيقات'],
    ['audiovisual-media', 'الإنتاج السمعي البصري والإعلام'],
  ]

  function arrow() {
    return h('span', { className: 'clevio-editor-home__arrow', 'aria-hidden': 'true' }, '←')
  }

  function Welcome() {
    return h('div', { className: 'clevio-editor-home', lang: 'ar', dir: 'rtl' },
      h('div', { className: 'clevio-editor-home__inner' },
        h('section', { className: 'clevio-editor-home__intro', 'aria-labelledby': 'clevio-editor-title' },
          h('header', { className: 'clevio-editor-home__header' },
            h('img', { className: 'clevio-editor-home__brand', src: '../images/clevio-logo.svg', alt: 'Clevio', width: 104, height: 30 }),
            h('a', { className: 'clevio-editor-home__preview', href: '../', target: '_blank', rel: 'noopener noreferrer' },
              'معاينة الموقع', h('span', { 'aria-hidden': 'true' }, '↗'),
            ),
          ),
          h('p', { className: 'clevio-editor-home__eyebrow' }, 'لوحة إدارة المحتوى'),
          h('h1', { id: 'clevio-editor-title' }, 'ماذا تريد أن تعدّل؟'),
          h('p', null, 'ابدأ باختيار إحدى المهام. بعد الحفظ، يظهر التغيير على الموقع عند اكتمال النشر.'),
        ),
        h('nav', { className: 'clevio-editor-home__tasks', 'aria-label': 'مهام التحرير' },
          tasks.map((task) => h('article', { className: 'clevio-editor-home__task', key: task.href },
            h('span', { className: 'clevio-editor-home__icon', 'aria-hidden': 'true' },
              h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
                task.icon.map((d) => h('path', { key: d, d })),
              ),
            ),
            h('h2', null, task.title),
            h('p', null, task.text),
            h('a', { className: 'clevio-editor-home__action', href: task.href }, task.link, arrow()),
          )),
        ),
        h('section', { className: 'clevio-editor-home__galleries', 'aria-labelledby': 'clevio-editor-galleries' },
          h('h2', { id: 'clevio-editor-galleries' }, 'افتح معرضًا مباشرةً'),
          h('div', { className: 'clevio-editor-home__gallery-list' },
            galleries.map(([id, title]) => h('a', { key: id, href: entry('galleries', id) }, title, arrow())),
          ),
        ),
        h('aside', { className: 'clevio-editor-home__guide', 'aria-labelledby': 'clevio-editor-help' },
          h('h2', { id: 'clevio-editor-help' }, 'أول مرة تستخدم اللوحة؟'),
          h('ol', null,
            h('li', null, 'افتح القسم الذي تريد تعديله.'),
            h('li', null, 'عدّل النص أو أضف صورة.'),
            h('li', null, 'اضغط حفظ، ثم عاين الموقع بعد النشر.'),
          ),
        ),
      ),
    )
  }

  cms.registerCustomPage({ id: 'start', label: 'ابدأ هنا', icon: 'space_dashboard', component: Welcome })
  if (!window.location.hash || window.location.hash === '#/') {
    window.history.replaceState(window.history.state, '', start)
  }
  cms.init()
})()
