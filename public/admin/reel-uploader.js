/* global window */
(() => {
  const gallery = '#/collections/galleries/entries/audiovisual-media'
  const acceptedTypes = 'video/mp4,video/webm,.mp4,.webm'
  const titleLimit = 120
  const bytesPerMiB = 1024 * 1024
  const arabicNumber = new window.Intl.NumberFormat('ar-DZ', { maximumFractionDigits: 1 })

  function errorMessage(error, maxMiB) {
    if (error?.status === 401 || ['auth', 'unauthorized', 'sign_in_required'].includes(error?.code)) {
      return 'سجّل الدخول مجددًا إلى لوحة المحتوى، ثم أعد المحاولة.'
    }
    if ((error?.status === 403 && error?.code !== 'rate_limit') || ['forbidden', 'permission'].includes(error?.code)) {
      return 'تحقّق من أن حساب GitHub لديه صلاحية الكتابة في مستودع Clevio.'
    }
    if (error?.status === 413 || ['size', 'file_too_large', 'invalid_size'].includes(error?.code)) {
      return 'حجم الفيديو يتجاوز الحد المسموح به وهو ' + maxMiB + ' ميغابايت.'
    }
    if (['format', 'invalid_file', 'unsupported_format'].includes(error?.code)) return 'اختر ملف فيديو بصيغة MP4 أو WebM.'
    if (['title', 'invalid_title'].includes(error?.code)) return 'أدخل عنوانًا قصيرًا للفيديو.'
    if (error?.status === 409 || error?.code === 'conflict') return 'تغيّر المعرض أثناء النشر. أعد المحاولة لحفظ الفيديو.'
    if (error?.status === 429 || error?.code === 'rate_limit') return 'هناك طلبات كثيرة حاليًا. أعد المحاولة بعد قليل.'
    if (error?.name === 'TypeError' || error?.code === 'network') return 'توقّف الاتصال أثناء رفع الفيديو. تحقّق من الإنترنت ثم أعد المحاولة.'
    return 'تعذّر حفظ الفيديو. أعد المحاولة.'
  }

  function playbackLink(value) {
    if (typeof value !== 'string' || !value) return null
    try {
      const url = new window.URL(value, window.location.origin)
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
    } catch {
      return null
    }
  }

  window.ClevioReelUploader = {
    register(cms) {
      const { createElement: h, useEffect, useRef, useState } = cms.React

      function ReelUploader() {
        const upload = window.ClevioReelUpload
        const maxBytes = upload?.maxBytes || 50 * bytesPerMiB
        const maxMiB = arabicNumber.format(maxBytes / bytesPerMiB)
        const [file, setFile] = useState(null)
        const [title, setTitle] = useState('')
        const [progress, setProgress] = useState(null)
        const [error, setError] = useState('')
        const [published, setPublished] = useState(null)
        const fileInput = useRef(null)
        const request = useRef(null)

        useEffect(() => {
          function confirmLeave(event) {
            if (!request.current) return
            event.preventDefault()
            event.returnValue = true
          }
          window.addEventListener('beforeunload', confirmLeave)
          return () => {
            window.removeEventListener('beforeunload', confirmLeave)
            const pending = request.current
            request.current = null
            if (pending?.phase === 'upload') pending.controller.abort()
          }
        }, [])

        function selectFile(next) {
          setError('')
          setPublished(null)
          if (!next || next.size === 0 || next.size > maxBytes || !/\.(mp4|webm)$/i.test(next.name)) {
            setFile(null)
            if (fileInput.current) fileInput.current.value = ''
            if (next) {
              setError(errorMessage({ code: next.size > maxBytes ? 'file_too_large' : 'invalid_file' }, maxMiB))
            }
            return
          }
          setFile(next)
        }

        async function submit(event) {
          event.preventDefault()
          if (request.current) return
          const cleanTitle = title.trim()
          if (!file || !cleanTitle) {
            setError('اختر فيديو وأدخل عنوانه قبل النشر.')
            if (!file) fileInput.current?.focus()
            return
          }
          if (typeof upload?.publish !== 'function') {
            setError('أداة الرفع غير متاحة الآن. حدّث الصفحة ثم أعد المحاولة.')
            return
          }

          const pending = { controller: new window.AbortController(), phase: 'upload' }
          request.current = pending
          setError('')
          setPublished(null)
          setProgress({ phase: 'upload', percent: 0 })
          try {
            const result = await upload.publish({
              file,
              title: cleanTitle,
              signal: pending.controller.signal,
              onProgress: ({ phase, percent }) => {
                if (request.current !== pending) return
                pending.phase = phase
                setProgress({ phase, percent: Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : null })
              },
            })
            if (request.current !== pending) return
            setPublished({ url: playbackLink(result?.url), galleryHref: '?reels=' + Date.now() + gallery })
            setTitle('')
            setFile(null)
            if (fileInput.current) fileInput.current.value = ''
          } catch (failure) {
            if (request.current !== pending) return
            setError(pending.controller.signal.aborted ? 'تم إيقاف الرفع. يمكنك المحاولة مجددًا.' : errorMessage(failure, maxMiB))
          } finally {
            if (request.current === pending) {
              request.current = null
              setProgress(null)
            }
          }
        }

        const pending = progress !== null
        const progressLabel = progress?.phase === 'publish' ? 'جارٍ حفظ الفيديو في المعرض…' : 'جارٍ رفع الفيديو…'
        return h('div', { className: 'clevio-reel-uploader', lang: 'ar', dir: 'rtl' },
          h('div', { className: 'clevio-reel-uploader__inner' },
            h('header', { className: 'clevio-reel-uploader__header' },
              pending
                ? h('span', { className: 'clevio-reel-uploader__stay' }, 'أبقِ هذه الصفحة مفتوحة حتى يكتمل الحفظ.')
                : h('a', { href: '#/pages/start' }, 'العودة إلى لوحة المحتوى'),
              h('h1', null, 'رفع ريلز'),
              h('p', null, 'اختر فيديو عموديًا لعرضه في قسم الإنتاج السمعي البصري والإعلام.'),
            ),
            h('form', { className: 'clevio-reel-uploader__form', onSubmit: submit, 'aria-label': 'إضافة فيديو ريلز' },
              h('label', { htmlFor: 'clevio-reel-file' }, 'ملف الفيديو'),
              h('input', {
                id: 'clevio-reel-file',
                type: 'file',
                accept: acceptedTypes,
                ref: fileInput,
                disabled: pending,
                'aria-describedby': 'clevio-reel-types',
                onChange: event => selectFile(event.currentTarget.files?.[0]),
              }),
              h('p', { id: 'clevio-reel-types', className: 'clevio-reel-uploader__hint' },
                'MP4 أو WebM بنسبة 9:16 حتى ' + maxMiB + ' ميغابايت.'),
              file && h('p', { className: 'clevio-reel-uploader__filename' },
                h('bdi', null, file.name),
                ' · ' + arabicNumber.format(file.size / bytesPerMiB) + ' ميغابايت',
              ),
              h('label', { htmlFor: 'clevio-reel-title' }, 'عنوان الفيديو'),
              h('input', {
                id: 'clevio-reel-title',
                type: 'text',
                value: title,
                maxLength: titleLimit,
                required: true,
                dir: 'auto',
                disabled: pending,
                onChange: event => setTitle(event.currentTarget.value),
              }),
              error && h('p', { className: 'clevio-reel-uploader__error', role: 'alert' }, error),
              progress && h('div', { className: 'clevio-reel-uploader__progress' },
                h('span', { id: 'clevio-reel-progress-label', role: 'status' }, progressLabel),
                h('progress', {
                  'aria-labelledby': 'clevio-reel-progress-label',
                  max: 100,
                  value: progress.phase === 'upload' && progress.percent !== null ? progress.percent : undefined,
                }),
              ),
              published && h('div', { className: 'clevio-reel-uploader__success', role: 'status' },
                h('p', null, 'تم حفظ الفيديو. سيظهر ضمن «مقاطع ريلز» بعد اكتمال نشر الموقع.'),
                published.url && h('a', { href: published.url, target: '_blank', rel: 'noopener noreferrer' }, 'رابط الفيديو بعد النشر'),
              ),
              h('div', { className: 'clevio-reel-uploader__actions' },
                h('button', { type: 'submit', disabled: pending }, 'رفع ونشر الفيديو'),
                progress?.phase === 'upload' && h('button', {
                  className: 'clevio-reel-uploader__cancel',
                  type: 'button',
                  onClick: () => request.current?.controller.abort(),
                }, 'إيقاف الرفع'),
                !pending && h('a', { href: published?.galleryHref ?? gallery }, 'إدارة فيديوهات المعرض'),
              ),
            ),
          ),
        )
      }

      cms.registerCustomPage({ id: 'reels', label: 'رفع ريلز', icon: 'video_library', component: ReelUploader })
    },
  }
})()
