/* global window */
(() => {
  const apiUrl = 'https://api.github.com/repos/YakoubBatouche/Clevio'
  const galleryPath = 'src/content/portfolio/audiovisual-media.json'
  const maxBytes = 50 * 1024 * 1024
  const partBytes = 20 * 1024 * 1024
  const apiHeaders = {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }

  function failure(code, status = 0) {
    return Object.assign(new Error(code), { code, status })
  }

  function githubError(status, remaining, message) {
    if (status === 401) return failure('auth', status)
    if (status === 429 || (status === 403 && (remaining === '0' || /rate limit/i.test(message)))) {
      return failure('rate_limit', status)
    }
    if (status === 403 || status === 404) return failure('permission', status)
    if (status === 413 || (status === 422 && /too large|size limit/i.test(message))) return failure('size', status)
    return failure('publish', status)
  }

  function accountToken() {
    let account
    try {
      account = JSON.parse(window.localStorage.getItem('sveltia-cms.user') || 'null')
    } catch {
      throw failure('auth')
    }
    if (account?.backendName !== 'github' || typeof account.token !== 'string' || !account.token) {
      throw failure('auth')
    }
    return account.token
  }

  function readBase64(file, signal) {
    signal?.throwIfAborted()
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader()
      const abort = () => reader.abort()
      signal?.addEventListener('abort', abort, { once: true })
      reader.onloadend = () => {
        signal?.removeEventListener('abort', abort)
        if (signal?.aborted) reject(signal.reason)
        else if (typeof reader.result === 'string') resolve(reader.result.slice(reader.result.indexOf(',') + 1))
        else reject(failure('format'))
      }
      reader.readAsDataURL(file)
    })
  }

  function uploadBlob(content, headers, signal, onProgress) {
    signal?.throwIfAborted()
    return new Promise((resolve, reject) => {
      const request = new window.XMLHttpRequest()
      const abort = () => request.abort()
      request.open('POST', apiUrl + '/git/blobs')
      request.responseType = 'json'
      for (const [key, value] of Object.entries(headers)) request.setRequestHeader(key, value)
      request.upload.onprogress = ({ loaded, total, lengthComputable }) => {
        if (lengthComputable && total > 0) onProgress(loaded / total)
      }
      request.onload = () => {
        if (request.status === 201 && /^[a-f\d]{40}$/.test(request.response?.sha ?? '')) {
          resolve(request.response.sha)
        } else {
          reject(githubError(request.status, request.getResponseHeader('x-ratelimit-remaining'), request.response?.message))
        }
      }
      request.onerror = () => reject(failure('network'))
      request.onabort = () => reject(signal?.reason ?? failure('network'))
      request.onloadend = () => signal?.removeEventListener('abort', abort)
      signal?.addEventListener('abort', abort, { once: true })
      request.send(JSON.stringify({ content, encoding: 'base64' }))
    })
  }

  async function publish({ file, title, onProgress = () => {}, signal }) {
    const name = title?.trim()
    if (!name || name.length > 120) throw failure('title')
    const extension = file?.name?.match(/\.(mp4|webm)$/i)?.[1].toLowerCase()
    if (!extension || !file.size) throw failure('format')
    if (file.size > maxBytes) throw failure('size')
    const headers = { ...apiHeaders, Authorization: 'Bearer ' + accountToken() }

    async function git(path, method = 'GET', body, accept = apiHeaders.Accept) {
      signal?.throwIfAborted()
      let response
      try {
        response = await window.fetch(apiUrl + path, {
          method, signal, cache: 'no-store', redirect: 'error',
          headers: { ...headers, Accept: accept },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
      } catch {
        signal?.throwIfAborted()
        throw failure('network')
      }
      const data = await response.json().catch(() => null)
      if (!response.ok) throw githubError(response.status, response.headers.get('x-ratelimit-remaining'), data?.message)
      if (!data) throw failure('publish')
      return data
    }

    async function getHead() {
      const ref = await git('/git/ref/heads/main')
      if (!ref.object?.sha) throw failure('publish')
      return ref.object.sha
    }

    onProgress({ phase: 'upload', percent: 0 })
    const digest = await window.crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    const hash = Array.from(new window.Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    const id = 'reel-' + hash + '-' + extension
    const filename = hash + '.' + extension
    const path = 'uploads/reels/' + filename
    const result = { url: new window.URL('/' + path, window.location.origin).href }

    let head = await getHead()
    const parts = []
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const [parent, gallery] = await Promise.all([
        git('/git/commits/' + head),
        git('/contents/' + galleryPath + '?ref=' + head, 'GET', undefined, 'application/vnd.github.raw+json'),
      ])
      if (!parent.tree?.sha || gallery.id !== 'audiovisual-media' || (gallery.items != null && !Array.isArray(gallery.items))) {
        throw failure('publish')
      }
      const items = gallery.items ?? []
      if (items.some((item) => item?.id === id && item.video === '/' + path)) return result
      const entry = { id, title: name, video: '/' + path, filterId: 'reels' }

      if (!parts.length) {
        for (let offset = 0; offset < file.size; offset += partBytes) {
          const part = file.slice(offset, offset + partBytes)
          const content = await readBase64(part, signal)
          const sha = await uploadBlob(content, headers, signal, (fraction) => {
            const percent = Math.min(99, Math.round((offset + part.size * fraction) / file.size * 100))
            onProgress({ phase: 'upload', percent })
          })
          const index = String(parts.length).padStart(3, '0')
          parts.push({ path: 'media/reels/' + filename + '/part-' + index, mode: '100644', type: 'blob', sha })
        }
        onProgress({ phase: 'publish', percent: 100 })
      }

      const tree = await git('/git/trees', 'POST', {
        base_tree: parent.tree.sha,
        tree: [
          ...parts,
          { path: galleryPath, mode: '100644', type: 'blob', content: JSON.stringify({ ...gallery, items: [entry, ...items] }, null, 2) + '\n' },
        ],
      })
      if (!tree.sha) throw failure('publish')
      const commit = await git('/git/commits', 'POST', {
        message: 'Add a portfolio reel',
        tree: tree.sha,
        parents: [head],
      })
      if (!commit.sha) throw failure('publish')

      try {
        await git('/git/refs/heads/main', 'PATCH', { sha: commit.sha, force: false })
        return result
      } catch (error) {
        if (error.code !== 'network' && ![409, 422].includes(error.status)) throw error
        const latest = await getHead()
        if (latest === commit.sha) return result
        if (latest === head) {
          if (error.code === 'network') throw error
          throw failure('conflict', error.status)
        }
        head = latest
      }
    }
    throw failure('conflict')
  }

  window.ClevioReelUpload = { maxBytes, publish }
})()
