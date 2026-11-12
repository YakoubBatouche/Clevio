/* global AbortSignal, Response, TextDecoder, URL, fetch */
import { env } from 'node:process'

const maxBodyBytes = 32 * 1024
const repoUrl = 'https://api.github.com/repos/YakoubBatouche/Clevio'

export const leadId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const leadStatuses = new Set(['new', 'contacted', 'confirmed', 'declined', 'closed'])

export class ApiError extends Error {
  constructor(status, code, headers) {
    super(code)
    this.status = status
    this.headers = headers
  }
}

export async function api(handler) {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
  try {
    const { status = 200, body, headers: extra } = await handler()
    const responseHeaders = { ...headers, ...extra }
    return body === undefined
      ? new Response(null, { status, headers: responseHeaders })
      : Response.json(body, { status, headers: responseHeaders })
  } catch (error) {
    const expected = error instanceof ApiError
    const status = expected ? error.status : 503
    const code = expected ? error.message : 'unavailable'
    return Response.json({ error: code }, { status, headers: { ...headers, ...(expected ? error.headers : {}) } })
  }
}

export function requireSameOrigin(request) {
  const origin = request.headers.get('origin')
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    throw new ApiError(403, 'forbidden')
  }
}

export async function readJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    throw new ApiError(415, 'invalid_content_type')
  }

  if (Number(request.headers.get('content-length')) > maxBodyBytes) {
    throw new ApiError(413, 'body_too_large')
  }

  const reader = request.body?.getReader()
  if (!reader) throw new ApiError(400, 'invalid_body')

  const decoder = new TextDecoder('utf-8', { fatal: true })
  let total = 0
  let raw = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBodyBytes) {
        await reader.cancel().catch(() => {})
        throw new ApiError(413, 'body_too_large')
      }
      raw += decoder.decode(value, { stream: true })
    }
    const payload = JSON.parse(raw + decoder.decode())
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new ApiError(400, 'invalid_body')
    }
    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, 'invalid_body')
  } finally {
    reader.releaseLock()
  }
}

function textField(value, maxLength, multiline = false) {
  if (typeof value !== 'string') throw new ApiError(400, 'invalid_fields')
  const trimmed = value.trim()
  const controls = multiline ? trimmed.replace(/[\t\n\r]/g, '') : trimmed
  if (!trimmed || trimmed.length > maxLength || /\p{Cc}/u.test(controls)) {
    throw new ApiError(400, 'invalid_fields')
  }
  return trimmed
}

export function leadFields(payload) {
  if (payload.website !== undefined && payload.website !== '') {
    throw new ApiError(400, 'invalid_fields')
  }
  const name = textField(payload.name, 120)
  const contact = textField(payload.contact, 254)
  const service = textField(payload.service, 200)
  const brief = textField(payload.brief, 4000, true)
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  const digits = contact.replace(/\D/g, '')
  const phone = /^\+?[\d().\s-]+$/.test(contact) && digits.length >= 6 && digits.length <= 25
  if (!email && !phone) throw new ApiError(400, 'invalid_contact')
  return { name, contact, service, brief }
}

export async function requireAdmin(request) {
  requireSameOrigin(request)
  const match = /^Bearer ([A-Za-z0-9_]+)$/i.exec(request.headers.get('authorization') ?? '')
  if (!match || match[1].length > 512) throw new ApiError(401, 'unauthorized')

  const headers = {
    Authorization: `Bearer ${match[1]}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'clevio-client-inbox',
  }
  const options = { headers, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(6000) }
  const identity = await fetch('https://api.github.com/user', options)
  if (identity.status === 401) throw new ApiError(401, 'unauthorized')
  if (!identity.ok) throw new ApiError(503, 'authentication_unavailable')

  const { login } = await identity.json()
  const admins = (env.CLEVIO_LEADS_ADMINS ?? 'YakoubBatouche').toLowerCase().split(',').map((name) => name.trim())
  if (typeof login !== 'string' || !admins.includes(login.toLowerCase())) throw new ApiError(403, 'forbidden')

  const repo = await fetch(repoUrl, options)
  if (repo.status === 401) throw new ApiError(401, 'unauthorized')
  if (repo.status === 404 || (repo.status === 403 && repo.headers.get('x-ratelimit-remaining') !== '0')) {
    throw new ApiError(403, 'forbidden')
  }
  if (!repo.ok) throw new ApiError(503, 'authentication_unavailable')

  const { permissions } = await repo.json()
  if (!['push', 'maintain', 'admin'].some((permission) => permissions?.[permission] === true)) {
    throw new ApiError(403, 'forbidden')
  }
}
