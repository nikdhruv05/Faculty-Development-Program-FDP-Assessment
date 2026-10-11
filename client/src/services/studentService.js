const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api'

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed with status ${response.status}`)
  }

  return payload.data
}

export async function fetchStudents(params = {}, signal) {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.status && params.status !== 'All statuses') searchParams.set('status', params.status)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))

  const query = searchParams.toString()
  const path = query ? `/students?${query}` : '/students'

  return request(path, { signal })
}

export async function createStudent(student) {
  return request('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  })
}

export async function updateStudent(id, student) {
  return request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  })
}
