const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_STATUSES = ['Applied', 'Interview', 'Offered', 'Placed']

export function getStudentFieldErrors(student, options = {}) {
  const { students = [], editingId = null } = options
  const errors = {}

  if (!student.name?.trim()) {
    errors.name = 'Name is required.'
  }

  if (!student.email?.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(student.email.trim())) {
    errors.email = 'Enter a valid email address.'
  } else {
    const normalized = student.email.trim().toLowerCase()
    const duplicate = students.some(
      (record) =>
        record.email?.trim().toLowerCase() === normalized &&
        String(record._id) !== String(editingId),
    )
    if (duplicate) {
      errors.email = 'A student with this email already exists.'
    }
  }

  if (!student.course?.trim()) {
    errors.course = 'Course is required.'
  }

  if (student.status !== undefined && student.status !== null) {
    if (!String(student.status).trim()) {
      errors.status = 'Placement status is required.'
    } else if (!VALID_STATUSES.includes(student.status)) {
      errors.status = 'Choose a valid placement status.'
    }
  }

  return errors
}

export function validateStudent(student, options = {}) {
  const errors = getStudentFieldErrors(student, options)
  return errors.name || errors.email || errors.course || errors.status || ''
}
