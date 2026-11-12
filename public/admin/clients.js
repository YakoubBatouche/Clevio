/* global window */
(() => {
  const statuses = [
    { value: 'new', label: 'جديد' },
    { value: 'contacted', label: 'تم التواصل' },
    { value: 'confirmed', label: 'عميل مؤكد' },
    { value: 'declined', label: 'غير مهتم' },
    { value: 'closed', label: 'مكتمل' },
  ]
  const statusLabel = value => statuses.find(status => status.value === value)?.label || 'جديد'
  const numberFormat = new window.Intl.NumberFormat('ar')
  const dateFormat = new window.Intl.DateTimeFormat('ar-DZ', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers',
  })
  const number = value => numberFormat.format(value)

  function contactAction(contact) {
    const value = String(contact || '').trim()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      const [name, domain] = value.split('@')
      return { href: `mailto:${encodeURIComponent(name)}@${encodeURIComponent(domain)}`, label: 'مراسلة العميل' }
    }
    if (!/^[+\d()\s.-]+$/.test(value)) return null
    const phone = value.replace(/[^+\d]/g, '')
    return /^\+?\d{6,15}$/.test(phone) ? { href: 'tel:' + phone, label: 'اتصال بالعميل' } : null
  }

  function formattedDate(value) {
    const date = new window.Date(value)
    if (!Number.isFinite(date.getTime())) return 'وقت غير معروف'
    return dateFormat.format(date)
  }

  function errorMessage(error, fallback) {
    if (error?.status === 401) return 'انتهت جلسة الدخول. سجّل دخولك مجددًا ثم أعد المحاولة.'
    if (error?.status === 403) return 'يتطلب هذا القسم حسابًا لديه صلاحية إدارة طلبات العملاء.'
    if (error?.status === 503) return 'صندوق الطلبات غير متاح حاليًا. أعد المحاولة بعد قليل.'
    if (error?.status === 429) return 'هناك طلبات كثيرة حاليًا. أعد المحاولة بعد قليل.'
    if (error?.status === 409 || error?.status === 412) return 'تغيّرت حالة الطلب. حدّث القائمة ثم أعد المحاولة.'
    return fallback
  }

  window.ClevioClients = {
    register(cms, { loadLeads, updateLead, loadErrorMessage } = {}) {
      const { createElement: h, useCallback, useEffect, useRef, useState } = cms.React

      function Inbox() {
        const [leads, setLeads] = useState([])
        const [loading, setLoading] = useState(true)
        const [cursor, setCursor] = useState(null)
        const [error, setError] = useState(null)
        const [search, setSearch] = useState('')
        const [filter, setFilter] = useState('all')
        const [saving, setSaving] = useState({})
        const [saveErrors, setSaveErrors] = useState({})
        const [announcement, setAnnouncement] = useState('')
        const mounted = useRef(false)
        const loadSequence = useRef(0)
        const requestPending = useRef(false)
        const pendingUpdates = useRef(new Set())

        function showAccessError(error) {
          if (error?.status !== 401 && error?.status !== 403) return false
          setLeads([])
          setCursor(null)
          setError({ message: errorMessage(error) })
          return true
        }

        const refresh = useCallback(async (pageCursor = null) => {
          if (requestPending.current || pendingUpdates.current.size) return
          requestPending.current = true
          const sequence = ++loadSequence.current
          setLoading(true)
          setError(null)
          try {
            if (typeof loadLeads !== 'function') throw new Error('Inbox adapter unavailable')
            const result = await loadLeads(pageCursor ? { cursor: pageCursor } : {})
            const items = Array.isArray(result) ? result : result?.leads
            if (!Array.isArray(items)) throw new Error('Unexpected inbox response')
            if (mounted.current && sequence === loadSequence.current) {
              setLeads(current => {
                const unique = new Map((pageCursor ? current : []).map(item => [item.id, item]))
                for (const item of items) unique.set(item.id, item)
                return [...unique.values()].sort((a, b) => new window.Date(b.createdAt).getTime() - new window.Date(a.createdAt).getTime())
              })
              setCursor(typeof result.cursor === 'string' && result.cursor && result.cursor !== pageCursor ? result.cursor : null)
            }
          } catch (failure) {
            if (mounted.current && sequence === loadSequence.current && !showAccessError(failure)) {
              const fallback = typeof loadErrorMessage === 'function' ? loadErrorMessage(failure) : loadErrorMessage
              setError({ message: fallback || errorMessage(failure, 'تعذر تحميل الطلبات. أعد المحاولة.'), cursor: pageCursor })
            }
          } finally {
            if (sequence === loadSequence.current) {
              requestPending.current = false
              if (mounted.current) setLoading(false)
            }
          }
        }, [])

        useEffect(() => {
          mounted.current = true
          refresh()
          return () => {
            mounted.current = false
            loadSequence.current += 1
            requestPending.current = false
          }
        }, [refresh])

        async function changeStatus(lead, status) {
          if (requestPending.current || pendingUpdates.current.has(lead.id) || status === lead.status) return
          pendingUpdates.current.add(lead.id)
          setSaving(current => ({ ...current, [lead.id]: true }))
          setSaveErrors(current => ({ ...current, [lead.id]: '' }))
          setAnnouncement('')
          try {
            if (typeof updateLead !== 'function') throw new Error('Inbox adapter unavailable')
            const result = await updateLead(lead.id, status)
            const updated = result?.lead || result
            if (updated?.id !== lead.id || !statuses.some(item => item.value === updated.status)) {
              throw new Error('Unexpected status response')
            }
            if (!mounted.current) return
            setLeads(current => current.map(item => item.id === lead.id
              ? { ...item, ...updated }
              : item))
            setAnnouncement('تم حفظ حالة طلب ' + lead.name + '.')
          } catch (failure) {
            if (mounted.current && !showAccessError(failure)) {
              setSaveErrors(current => ({ ...current, [lead.id]: errorMessage(failure, 'تعذر حفظ الحالة. أعد اختيارها للمحاولة مرة أخرى.') }))
            }
          } finally {
            pendingUpdates.current.delete(lead.id)
            if (mounted.current) setSaving(current => ({ ...current, [lead.id]: false }))
          }
        }

        const busy = Object.values(saving).some(Boolean)
        const query = search.trim().toLocaleLowerCase('ar')
        const shown = leads.filter(lead => (filter === 'all' || lead.status === filter)
          && (!query || [lead.name, lead.contact, lead.service, lead.brief].join(' ').toLocaleLowerCase('ar').includes(query)))
        const counts = statuses.map(status => ({ ...status, count: leads.filter(lead => lead.status === status.value).length }))

        function leadCard(lead) {
          const action = contactAction(lead.contact)
          const id = 'clevio-lead-' + String(lead.id).replace(/[^a-zA-Z0-9_-]/g, '')
          return h('li', { className: 'clevio-clients__item', key: lead.id },
            h('article', { className: 'clevio-clients__card', 'aria-labelledby': id, 'data-status': lead.status || 'new' },
              h('div', { className: 'clevio-clients__card-top' },
                h('div', null,
                  h('p', { className: 'clevio-clients__service' }, lead.service || 'طلب مشروع'),
                  h('h3', { id }, lead.name),
                ),
                h('span', { className: 'clevio-clients__badge', 'data-status': lead.status || 'new' }, statusLabel(lead.status)),
              ),
              h('div', { className: 'clevio-clients__contact' },
                h('span', null, 'بيانات التواصل'),
                h('bdi', { dir: 'ltr' }, lead.contact),
              ),
              h('p', { className: 'clevio-clients__brief' }, lead.brief),
              h('div', { className: 'clevio-clients__card-meta' },
                h('time', { dateTime: lead.createdAt }, formattedDate(lead.createdAt)),
                action && h('a', { className: 'clevio-clients__contact-action', href: action.href }, action.label,
                  h('span', { 'aria-hidden': true }, '↗'),
                ),
              ),
              h('div', { className: 'clevio-clients__status-row' },
                h('label', { htmlFor: id + '-status' }, 'حالة الطلب'),
                h('select', {
                  id: id + '-status', value: lead.status || 'new', disabled: !!saving[lead.id] || loading,
                  'aria-label': 'حالة طلب ' + lead.name,
                  'aria-describedby': saveErrors[lead.id] ? id + '-error' : undefined,
                  onChange: event => changeStatus(lead, event.target.value),
                }, statuses.map(status => h('option', { value: status.value, key: status.value }, status.label))),
                h('span', { className: 'clevio-clients__save-state', role: 'status' }, saving[lead.id] ? 'جارٍ الحفظ…' : ''),
              ),
              saveErrors[lead.id] && h('p', { className: 'clevio-clients__error', id: id + '-error', role: 'alert' }, saveErrors[lead.id]),
            ),
          )
        }

        return h('div', { className: 'clevio-clients', lang: 'ar', dir: 'rtl' },
          h('div', { className: 'clevio-clients__inner' },
            h('header', { className: 'clevio-clients__header' },
              h('div', null,
                h('h1', null, 'طلبات العملاء'),
                h('p', null, 'تابع الطلبات الواردة من نموذج التواصل وحدّث حالة كل طلب.'),
              ),
              h('button', { className: 'clevio-clients__refresh', type: 'button', disabled: loading || busy, onClick: () => refresh() }, loading ? 'جارٍ التحديث…' : 'تحديث الطلبات'),
            ),
            h('div', { className: 'clevio-clients__summary', role: 'group', 'aria-label': 'ملخص الطلبات المحمّلة' },
              [['all', cursor ? 'الطلبات المحمّلة' : 'كل الطلبات', leads.length], ...counts.filter(status => ['new', 'contacted', 'confirmed'].includes(status.value)).map(status => [status.value, status.label, status.count])]
                .map(([value, label, count]) => h('button', {
                  key: value, className: 'clevio-clients__summary-card', type: 'button',
                  'aria-pressed': filter === value, onClick: () => setFilter(value),
                }, h('span', null, label), h('strong', null, (loading || error) && !leads.length ? '—' : number(count)))),
            ),
            h('section', { className: 'clevio-clients__workspace', 'aria-labelledby': 'clevio-inbox-title' },
              h('div', { className: 'clevio-clients__toolbar' },
                h('div', null,
                  h('h2', { id: 'clevio-inbox-title' }, 'متابعة الطلبات'),
                  h('p', null, 'تُحفظ الحالة تلقائيًا عند تغييرها.'),
                ),
                h('label', { className: 'clevio-clients__search' },
                  h('span', { className: 'clevio-clients__sr-only' }, 'البحث في طلبات العملاء'),
                  h('input', { type: 'search', value: search, placeholder: 'ابحث بالاسم أو الخدمة أو بيانات التواصل', onChange: event => setSearch(event.target.value) }),
                ),
              ),
              h('nav', { className: 'clevio-clients__filters', 'aria-label': 'تصفية حسب حالة الطلب' },
                [{ value: 'all', label: 'الكل' }, ...statuses].map(status => h('button', {
                  key: status.value, type: 'button', 'aria-pressed': filter === status.value,
                  onClick: () => setFilter(status.value),
                }, status.label)),
              ),
              h('p', { className: 'clevio-clients__result-count', role: 'status', 'aria-live': 'polite' }, loading ? 'جارٍ تحميل الطلبات…' : number(shown.length) + ' طلب'),
              error && h('div', { className: 'clevio-clients__error-banner', role: 'alert' },
                h('p', null, error.message),
                h('button', { type: 'button', onClick: () => refresh(error.cursor), disabled: loading || busy }, 'أعد المحاولة'),
              ),
              h('div', { 'aria-busy': loading },
                !loading && !error && !shown.length && h('div', { className: 'clevio-clients__empty' },
                  h('span', { 'aria-hidden': true, className: 'clevio-clients__empty-symbol' }, '↙'),
                  h('h3', null, leads.length ? 'لا توجد طلبات تطابق البحث' : 'أول طلب سيبدأ من هنا'),
                  h('p', null, cursor ? 'يمكنك تحميل المزيد من الطلبات لتوسيع البحث.' : leads.length ? 'جرّب اسمًا آخر أو اعرض جميع الحالات.' : 'ستظهر هنا الطلبات بعد إرسال نموذج التواصل من الموقع.'),
                  leads.length > 0 && h('button', { type: 'button', onClick: () => { setSearch(''); setFilter('all') } }, 'عرض جميع الطلبات'),
                ),
                h('ul', { className: 'clevio-clients__list', role: 'list' }, shown.map(leadCard)),
                cursor && h('button', { className: 'clevio-clients__more', type: 'button', onClick: () => refresh(cursor), disabled: loading || busy }, loading ? 'جارٍ التحميل…' : 'تحميل طلبات إضافية'),
              ),
            ),
            h('p', { className: 'clevio-clients__sr-only', role: 'status', 'aria-live': 'polite' }, announcement),
          ),
        )
      }

      cms.registerCustomPage({ id: 'clients', label: 'طلبات العملاء', icon: 'inbox', component: Inbox })
    },
  }
})()

