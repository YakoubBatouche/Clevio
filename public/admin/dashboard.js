/* global window */
(() => {
  const cms = window.CMS
  if (!cms) return

  const h = cms.React.createElement
  const start = '#/pages/start'
  const entry = (collection, file) => `#/collections/${collection}/entries/${file}`

  const tasks = [
    {
      title: 'طلبات العملاء',
      text: 'راجع طلبات المشاريع الواردة وحدّث حالة كل عميل.',
      link: 'افتح صندوق الطلبات',
      href: '#/pages/clients',
      icon: ['M4 5h16v14H4z', 'M4 13h5l1.5 3h3l1.5-3H20', 'M8 9h8'],
    },
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

  const editors = {
    homepage: {
      file: 'site',
      category: 'محتوى الموقع',
      title: 'الصفحة الرئيسية',
      help: 'اختر الجزء الذي تريد تحديثه، ثم عدّل حقوله واحفظ التغييرات.',
      sections: [
        ['hero', 'واجهة الصفحة'], ['about', 'نبذة الشركة'], ['partners', 'الشركاء'],
        ['contact', 'التواصل'], ['brand', 'الشعار والاسم'], ['navigation', 'القائمة العلوية'],
        ['footer', 'أسفل الصفحة'], ['seo', 'محركات البحث'],
      ],
    },
    services: {
      file: 'catalog',
      category: 'محتوى الموقع',
      title: 'الخدمات',
      help: 'افتح بطاقة خدمة لتعديل اسمها أو تفاصيلها. احفظ عند الانتهاء.',
      sections: [['items', 'بطاقات الخدمات'], ['title', 'عنوان القسم'], ['dialogEyebrow', 'نافذة تفاصيل الخدمة']],
    },
    galleries: {
      category: 'معارض الأعمال',
      title: 'صور الأعمال',
      help: 'ابدأ من الأعمال والصور لإضافة عمل أو تغييره أو إعادة ترتيبه.',
      sections: [['items', 'الأعمال والصور'], ['title', 'اسم المعرض ووصفه'], ['cover', 'صورة الغلاف'], ['filters', 'تصنيفات الأعمال']],
    },
    work: {
      file: 'presentation',
      category: 'محتوى الموقع',
      title: 'نصوص قسم الأعمال',
      help: 'عدّل العناوين والنصوص المشتركة التي تظهر للزوّار في معارض الأعمال.',
      sections: [['title', 'عنوان القسم'], ['sheetNote', 'نصوص المعرض'], ['allFilterLabel', 'الأزرار وأدوات العرض']],
    },
  }

  function addEditorTools() {
    const { document, location } = window
    const selector = '.content-editor .pane[data-mode="edit"][data-locale] :is(#first-pane-body, #second-pane-body) > .content'
    let activeTools
    let activeContent
    let jumpRequest = 0

    function jumpToField(content, keyPath) {
      const request = ++jumpRequest
      const route = location.hash

      function reveal(attempt = 0) {
        if (request !== jumpRequest || route !== location.hash || !content.isConnected) return

        const field = content.querySelector(`:scope > [data-key-path="${keyPath}"]`)
        if (!field) {
          // Sveltia mounts fields below the viewport when their placeholders scroll into view.
          const placeholder = content.querySelector(':scope > .placeholder')
          if (!placeholder || attempt >= 16) return
          placeholder.scrollIntoView({ block: 'center', inline: 'nearest' })
          window.setTimeout(() => reveal(attempt + 1), 45)
          return
        }

        field.querySelector(':scope > .field-wrapper > .wrapper > .header button[aria-expanded="false"]')?.click()
        window.requestAnimationFrame(() => {
          if (request !== jumpRequest || route !== location.hash || !field.isConnected) return
          field.tabIndex = -1
          field.focus({ preventScroll: true })
          field.scrollIntoView({ block: 'start', inline: 'nearest' })
        })
      }

      reveal()
    }

    function mount() {
      const route = location.hash.match(/^#\/collections\/([\w-]+)\/entries\/([\w-]+)(?:\?|$)/)
      const [, collection, file] = route ?? []
      const editor = Object.hasOwn(editors, collection) ? editors[collection] : undefined
      const galleryName = collection === 'galleries' ? galleries.find(([id]) => id === file)?.[1] : undefined

      if (!editor || (!galleryName && editor.file !== file)) {
        activeTools?.remove()
        activeTools = undefined
        activeContent = undefined
        return
      }

      const content = document.querySelector(selector)
      if (!content) return

      if (activeContent === content && activeTools?.nextElementSibling === content && activeTools.dataset.clevioEditor === `${collection}/${file}`) return

      const tools = document.createElement('section')
      tools.className = 'clevio-editor-tools'
      tools.dataset.clevioEditor = `${collection}/${file}`
      tools.lang = 'ar'
      tools.dir = 'rtl'

      const heading = document.createElement('div')
      heading.className = 'clevio-editor-tools__intro'
      const category = document.createElement('p')
      category.className = 'clevio-editor-tools__category'
      category.textContent = editor.category
      const title = document.createElement('h2')
      title.textContent = galleryName || editor.title
      const help = document.createElement('p')
      help.textContent = editor.help
      heading.append(category, title, help)

      const nav = document.createElement('nav')
      nav.className = 'clevio-editor-tools__sections'
      nav.setAttribute('aria-label', 'الانتقال إلى جزء من النموذج')
      const caption = document.createElement('span')
      caption.textContent = 'انتقل إلى'
      nav.append(caption)

      const compact = document.createElement('label')
      compact.className = 'clevio-editor-tools__compact'
      const compactCaption = document.createElement('span')
      compactCaption.textContent = caption.textContent
      const select = document.createElement('select')
      select.add(new window.Option('اختر قسمًا', ''))
      select.addEventListener('change', () => {
        if (select.value) jumpToField(content, select.value)
        select.selectedIndex = 0
      })
      compact.append(compactCaption, select)

      for (const [keyPath, label] of editor.sections) {
        if (keyPath === 'filters' && file === 'logos') continue

        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = label
        button.addEventListener('click', () => jumpToField(content, keyPath))
        nav.append(button)
        select.add(new window.Option(label, keyPath))
      }

      tools.append(heading, nav, compact)
      activeTools?.remove()
      content.before(tools)
      activeTools = tools
      activeContent = content
    }

    new window.MutationObserver(mount).observe(document.body, { childList: true, subtree: true })
    window.addEventListener('hashchange', mount)
    mount()
  }

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

  async function requestClients({ cursor, body } = {}) {
    let account
    try {
      // This is the account cache used by the pinned Sveltia build.
      account = JSON.parse(window.localStorage.getItem('sveltia-cms.user') || 'null')
    } catch {
      account = null
    }

    if (account?.backendName !== 'github' || typeof account.token !== 'string' || !account.token) {
      throw Object.assign(new Error('Dashboard sign-in required'), { status: 401 })
    }

    const url = new window.URL('/api/admin/leads', window.location.origin)
    if (cursor) url.searchParams.set('cursor', cursor)
    const headers = { Authorization: 'Bearer ' + account.token, Accept: 'application/json' }
    if (body) headers['Content-Type'] = 'application/json'
    const response = await window.fetch(url, {
      method: body ? 'PATCH' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      cache: 'no-store',
      redirect: 'error',
    })
    if (!response.ok) throw Object.assign(new Error('Client inbox request failed'), { status: response.status })
    return response.json()
  }

  cms.registerCustomPage({ id: 'start', label: 'ابدأ هنا', icon: 'space_dashboard', component: Welcome })
  window.ClevioClients?.register(cms, {
    loadLeads: requestClients,
    updateLead: (id, status) => requestClients({ body: { id, status } }),
  })
  if (!window.location.hash || window.location.hash === '#/') {
    window.history.replaceState(window.history.state, '', start)
  }
  addEditorTools()
  cms.init()
})()
