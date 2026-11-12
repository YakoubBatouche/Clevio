/* global URL */
import { api, ApiError, leadId, leadStatuses, readJson, requireAdmin } from '../../server/leads-http.js'
import { leadStore } from '../../server/leads-store.js'

export function GET(request) {
  return api(async () => {
    await requireAdmin(request)
    const cursor = new URL(request.url).searchParams.get('cursor')
    if (cursor && cursor.length > 2048) throw new ApiError(400, 'invalid_cursor')
    return { body: await leadStore(request).list(cursor) }
  })
}

export function PATCH(request) {
  return api(async () => {
    await requireAdmin(request)
    const { id: rawId, status } = await readJson(request)
    if (typeof rawId !== 'string' || !leadId.test(rawId) || !leadStatuses.has(status)) {
      throw new ApiError(400, 'invalid_fields')
    }

    const id = rawId.toLowerCase()
    const store = leadStore(request)
    const current = await store.read(id)
    if (!current) throw new ApiError(404, 'not_found')
    if (current.lead.status === status) return { body: { lead: current.lead } }
    if (!current.etag) throw new ApiError(503, 'storage_unavailable')

    const lead = { ...current.lead, status, updatedAt: new Date().toISOString() }
    if (!await store.write(lead, current.etag)) throw new ApiError(409, 'status_conflict')
    return { body: { lead } }
  })
}
