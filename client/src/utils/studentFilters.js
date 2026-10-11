export function filterStudents(students, search, status) {
  const term = search.trim().toLowerCase()
  const filterByStatus = status && status !== 'All statuses'

  return students.filter((student) => {
    const matchesStatus = !filterByStatus || student.status === status
    if (!matchesStatus) return false

    if (!term) return true

    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    )
  })
}
