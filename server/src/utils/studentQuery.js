const VALID_STATUSES = ['Applied', 'Interview', 'Offered', 'Placed']

export class StudentQueryError extends Error {
  constructor(message) {
    super(message)
    this.name = 'StudentQueryError'
  }
}

function parsePositiveInt(value, fallback) {
  if (value === undefined || value === '') {
    return fallback
  }

  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new StudentQueryError('Invalid pagination parameter')
  }

  return parsed
}

export function buildStudentQuery(query = {}) {
  const filter = {}

  const search = typeof query.q === 'string' ? query.q.trim() : ''
  if (search) {
    filter.search = search
  }

  const status = query.status
  if (status !== undefined && status !== '' && status !== 'All statuses') {
    if (!VALID_STATUSES.includes(status)) {
      throw new StudentQueryError('Invalid placement status filter')
    }
    filter.status = status
  }

  const page = parsePositiveInt(query.page, 1)
  const pageSize = parsePositiveInt(query.pageSize ?? query.limit, 10)

  return { filter, page, pageSize }
}

export function toMongoFilter(filter) {
  const mongo = {}

  if (filter.status) {
    mongo.status = filter.status
  }

  if (filter.search) {
    const escaped = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    mongo.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ]
  }

  return mongo
}
