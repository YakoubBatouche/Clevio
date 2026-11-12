import { env } from 'node:process'
import { api, ApiError, leadFields, leadId, readJson, requireSameOrigin } from '../server/leads-http.js'
import { leadStore } from '../server/leads-store.js'

const attempts = new Map()
const windowMs = 60_000

function limitSubmissions(request) {
  // The Vercel edge supplies this header. Keep a small per-instance burst limit.
  const address = env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : null
  if (!address) return

  const now = Date.now()
  for (const [key, attempt] of attempts) {
    if (attempt.expiresAt <= now) attempts.delete(key)
  }
  const attempt = attempts.get(address) ?? { count: 0, expiresAt: now + windowMs }
  if (attempt.count >= 8) {
    const wait = Math.ceil((attempt.expiresAt - now) / 1000)
    throw new ApiError(429, 'rate_limited', { 'Retry-After': String(wait) })
  }
  if (attempts.size >= 1024 && !attempts.has(address)) {
    throw new ApiError(429, 'rate_limited', { 'Retry-After': '60' })
  }
  attempt.count += 1
  attempts.set(address, attempt)
}

export function HEAD(request) {
  return api(() => {
    leadStore(request)
    return { status: 204 }
  })
}

export function POST(request) {
  return api(async () => {
    requireSameOrigin(request)
    limitSubmissions(request)
    const id = request.headers.get('idempotency-key')?.toLowerCase()
    if (!id || !leadId.test(id)) throw new ApiError(400, 'invalid_idempotency_key')
    const fields = leadFields(await readJson(request))
    const store = leadStore(request)
    const timestamp = new Date().toISOString()
    const lead = { id, ...fields, status: 'new', createdAt: timestamp, updatedAt: timestamp }

    if (await store.write(lead)) return { status: 201, body: { ok: true } }

    const previous = await store.read(id)
    if (!previous) throw new ApiError(503, 'storage_unavailable')
    if (!Object.entries(fields).every(([key, value]) => previous.lead[key] === value)) {
      throw new ApiError(409, 'idempotency_conflict')
    }
    return { body: { ok: true } }
  })
}
