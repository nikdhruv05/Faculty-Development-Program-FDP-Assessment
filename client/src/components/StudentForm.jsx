import { useState } from 'react'
import { getStudentFieldErrors } from '../utils/studentValidation.js'

const statuses = ['Applied', 'Interview', 'Offered', 'Placed']

function StudentForm({ student, existingStudents, onClose, onSubmit }) {
  const [values, setValues] = useState({
    name: student?.name ?? '',
    email: student?.email ?? '',
    course: student?.course ?? '',
    status: student?.status ?? 'Applied',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = getStudentFieldErrors(values, {
      students: existingStudents,
      editingId: student?._id ?? null,
    })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (submitError) {
      setSubmitError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="student-form-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">STUDENT DIRECTORY</p>
            <h2 id="student-form-title">{student ? 'Edit student' : 'Add student'}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Close form" onClick={onClose}>×</button>
        </div>
        <form className="student-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            Student name
            <input name="name" value={values.name} onChange={updateField} autoFocus />
            {fieldErrors.name && <span className="field-error" role="alert">{fieldErrors.name}</span>}
          </label>
          <label className="form-field">
            Email address
            <input name="email" type="email" value={values.email} onChange={updateField} />
            {fieldErrors.email && <span className="field-error" role="alert">{fieldErrors.email}</span>}
          </label>
          <label className="form-field">
            Course
            <input name="course" value={values.course} onChange={updateField} placeholder="e.g. B.Tech CSE" />
            {fieldErrors.course && <span className="field-error" role="alert">{fieldErrors.course}</span>}
          </label>
          <label className="form-field">
            Placement status
            <select name="status" value={values.status} onChange={updateField}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            {fieldErrors.status && <span className="field-error" role="alert">{fieldErrors.status}</span>}
          </label>
          {submitError && <p className="form-error" role="alert">{submitError}</p>}
          <div className="form-actions">
            <button className="cancel-button" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : student ? 'Save changes' : 'Add student'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default StudentForm
