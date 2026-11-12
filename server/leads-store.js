/* global AbortSignal, Headers, URL, fetch */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { env } from 'node:process'
import { ApiError, leadId, leadStatuses } from './leads-http.js'

const prefix = 'clevio-client-requests/v1/'
const blobApi = 'https://vercel.com/api/blob'

// These requests use the control plane and private reads from Vercel's Blob SDK.
function credentials(request) {
  if (env.VERCEL_ENV === 'preview') throw new ApiError(503, 'storage_unavailable')

  const storeId = env.BLOB_STORE_ID?.trim().replace(/^store_/, '')
  const oidc = (env.VERCEL === '1' ? request.headers.get('x-vercel-oidc-token') : null) || env.VERCEL_OIDC_TOKEN
  if (storeId && /^[A-Za-z0-9]+$/.test(storeId) && oidc?.trim()) {
    return { storeId, token: oidc.trim() }
  }

  const token = env.BLOB_READ_WRITE_TOKEN?.trim()
  const legacyStoreId = token?.match(/^vercel_blob_rw_([A-Za-z0-9]+)_.+$/)?.[1]
  if (legacyStoreId) return { storeId: legacyStoreId, token }
  throw new ApiError(503, 'storage_unavailable')
}

function pathFor(id) {
  return `${prefix}${id}.json`
}

function asLead(value, id) {
  if (!value || value.id !== id || !leadStatuses.has(value.status) ||
      !['name', 'contact', 'service', 'brief', 'createdAt', 'updatedAt'].every((key) => typeof value[key] === 'string')) {
    throw new ApiError(503, 'storage_unavailable')
  }
  const { name, contact, service, brief, createdAt, updatedAt, status } = value
  return { id, name, contact, service, brief, createdAt, updatedAt, status }
}

export function leadStore(request) {
  const { storeId, token } = credentials(request)

  async function control(url, method, extraHeaders, body) {
    const headers = new Headers(extraHeaders)
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('X-Api-Version', '13')
    headers.set('X-Vercel-Blob-Store-Id', storeId)
    headers.set('X-Api-Blob-Request-Id', `${storeId}:${Date.now()}:${randomUUID()}`)
    headers.set('X-Api-Blob-Request-Attempt', '0')
    return fetch(url, { method, headers, body, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(7000) })
  }

  async function read(id) {
    const url = new URL(pathFor(id), `https://${storeId}.private.blob.vercel-storage.com/`)
    url.searchParams.set('cache', '0')
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    })
    if (response.status === 404) return null
    if (!response.ok) throw new ApiError(503, 'storage_unavailable')
    return { lead: asLead(await response.json(), id), etag: response.headers.get('etag') }
  }

  async function write(lead, etag) {
    const url = new URL(`${blobApi}/`)
    url.searchParams.set('pathname', pathFor(lead.id))
    const body = JSON.stringify(lead)
    const response = await control(url, 'PUT', {
      'Content-Type': 'application/json',
      'X-Content-Length': String(Buffer.byteLength(body)),
      'X-Content-Type': 'application/json',
      'X-Vercel-Blob-Access': 'private',
      'X-Add-Random-Suffix': '0',
      'X-Allow-Overwrite': etag ? '1' : '0',
      'X-Cache-Control-Max-Age': '60',
      ...(etag ? { 'X-If-Match': etag } : {}),
    }, body)
    if (response.ok) {
      const stored = await response.json()
      const target = new URL(stored.url)
      if (target.protocol !== 'https:' || target.hostname !== `${storeId.toLowerCase()}.private.blob.vercel-storage.com`) {
        throw new ApiError(503, 'storage_unavailable')
      }
      return true
    }
    const { error } = await response.json().catch(() => ({}))
    if (response.status === 409 || response.status === 412 || error?.code === 'precondition_failed' ||
        (response.status === 400 && /already exists|allowOverwrite/i.test(error?.message ?? ''))) return false
    throw new ApiError(503, 'storage_unavailable')
  }

  async function list(cursor) {
    const url = new URL(blobApi)
    url.searchParams.set('prefix', prefix)
    url.searchParams.set('limit', '30')
    if (cursor) url.searchParams.set('cursor', cursor)

    const response = await control(url, 'GET')
    if (!response.ok) throw new ApiError(503, 'storage_unavailable')
    const page = await response.json()
    if (!Array.isArray(page.blobs)) throw new ApiError(503, 'storage_unavailable')

    const ids = page.blobs
      .map(({ pathname }) => typeof pathname === 'string' && pathname.startsWith(prefix) && pathname.endsWith('.json')
        ? pathname.slice(prefix.length, -5)
        : '')
      .filter((id) => leadId.test(id))
    const records = []
    for (let offset = 0; offset < ids.length; offset += 8) {
      records.push(...await Promise.all(ids.slice(offset, offset + 8).map(read)))
    }
    const leads = records.filter(Boolean).map(({ lead }) => lead)
    leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return { leads, ...(page.hasMore && page.cursor ? { cursor: page.cursor } : {}) }
  }

  return { read, write, list }
}
