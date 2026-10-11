import { useEffect, useState } from 'react'
import StudentForm from './components/StudentForm.jsx'
import StudentTable from './components/StudentTable.jsx'
import { sampleStudents } from './data/sampleStudents.js'
import { createStudent, fetchStudents, updateStudent } from './services/studentService.js'
import { filterStudents } from './utils/studentFilters.js'
import './App.css'

function App() {
  const [apiStudents, setApiStudents] = useState([])
  const [previewStudents, setPreviewStudents] = useState(sampleStudents)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [source, setSource] = useState('api')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const students = source === 'preview' ? previewStudents : apiStudents

  useEffect(() => {
    if (source !== 'api') {
      return undefined
    }

    const controller = new AbortController()

    fetchStudents({}, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) {
          setApiStudents(records)
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [source, refreshKey])

  const visibleStudents = filterStudents(students, query, statusFilter)
  const placedCount = students.filter((student) => student.status === 'Placed').length
  const offeredCount = students.filter((student) => student.status === 'Offered').length

  function openCreateForm() {
    setEditingStudent(null)
    setFormOpen(true)
    setNotice('')
  }

  function openEditForm(student) {
    setEditingStudent(student)
    setFormOpen(true)
    setNotice('')
  }

  function selectSource(nextSource) {
    setSource(nextSource)
    setError('')
    setLoading(nextSource === 'api')
  }

  function retryLoading() {
    setError('')
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  async function handleSave(values) {
    const editing = editingStudent

    if (source === 'preview') {
      if (editing) {
        setPreviewStudents((current) =>
          current.map((student) =>
            student._id === editing._id ? { ...student, ...values } : student,
          ),
        )
      } else {
        setPreviewStudents((current) => [{ ...values, _id: crypto.randomUUID() }, ...current])
      }
    } else if (editing) {
      const updated = await updateStudent(editing._id, values)
      setApiStudents((current) =>
        current.map((student) => (student._id === updated._id ? updated : student)),
      )
    } else {
      const created = await createStudent(values)
      setApiStudents((current) => [created, ...current])
    }

    setFormOpen(false)
    setEditingStudent(null)
    setNotice(editing ? 'Student updated.' : 'Student added.')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main" aria-label="Campus records home">
          <span className="brand-mark" aria-hidden="true">CR</span>
          <span>Campus records</span>
        </a>
        <div className="topbar-meta">
          <span className="term-label">PLACEMENT CELL <i /></span>
          <span className="term-name">2025–26</span>
        </div>
      </header>

      <section className="page-content" id="main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">STUDENT OUTCOMES / OVERVIEW</p>
            <h1>Campus placement records</h1>
            <p className="heading-copy">A clear view of every student's next step.</p>
          </div>
          <button className="primary-button" type="button" onClick={openCreateForm}>
            <span aria-hidden="true">+</span> Add student
          </button>
        </div>

        <section className="summary-grid" aria-label="Placement summary">
          <article className="summary-item summary-total">
            <span className="summary-label">TOTAL STUDENTS</span>
            <strong>{students.length}</strong>
            <span className="summary-foot">In the current view</span>
          </article>
          <article className="summary-item">
            <span className="summary-label">PLACED</span>
            <strong>{placedCount}</strong>
            <span className="summary-foot">Offer accepted</span>
          </article>
          <article className="summary-item">
            <span className="summary-label">OFFERS</span>
            <strong>{offeredCount}</strong>
            <span className="summary-foot">Awaiting decision</span>
          </article>
          <article className="summary-aside">
            <span className="aside-symbol" aria-hidden="true">↗</span>
            <span>Spring placement<br />cycle</span>
            <small>RECORDS UPDATED AS THEY PROGRESS</small>
          </article>
        </section>

        <section className="records-section" aria-labelledby="records-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DIRECTORY</p>
              <h2 id="records-title">Student records <span>{students.length}</span></h2>
            </div>
            <div className="source-switch" aria-label="Records source">
              <button
                type="button"
                className={source === 'api' ? 'selected' : ''}
                aria-pressed={source === 'api'}
                onClick={() => selectSource('api')}
              >API data</button>
              <button
                type="button"
                className={source === 'preview' ? 'selected' : ''}
                aria-pressed={source === 'preview'}
                onClick={() => selectSource('preview')}
              >Sample preview</button>
            </div>
          </div>

          {notice && <p className="notice-message" role="status">{notice}</p>}

          <div className="table-toolbar">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Search students by name or email</span>
              <input
                type="search"
                value={query}
                placeholder="Search name or email"
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
            </label>
            <label className="filter-field">
              <span className="sr-only">Filter by placement status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offered</option>
                <option>Placed</option>
              </select>
            </label>
            {(query || statusFilter !== 'All statuses') && (
              <button
                className="text-button clear-filters"
                type="button"
                onClick={() => { setQuery(''); setStatusFilter('All statuses') }}
              >Clear filters</button>
            )}
            <span className="record-count">{visibleStudents.length} RECORDS</span>
          </div>

          {error && (
            <div className="state-panel error-panel" role="alert">
              <strong>Records could not be loaded</strong>
              <p>{error}</p>
              <button className="secondary-button" type="button" onClick={retryLoading}>Try again</button>
            </div>
          )}
          {!error && loading && <div className="state-panel" role="status">Loading student records…</div>}
          {!error && !loading && (
            <StudentTable
              students={visibleStudents}
              hasFilters={Boolean(query || statusFilter !== 'All statuses')}
              onEdit={openEditForm}
            />
          )}
          <div className="table-footer">
            <span>PLACEMENT OFFICE <i /></span>
            <span>{source === 'preview' ? 'SAMPLE DATA' : 'LIVE RECORDS'}</span>
          </div>
        </section>
      </section>

      <footer className="page-footer">
        <span>Campus placement office</span>
        <span>INTERNAL RECORDS · {new Date().getFullYear()}</span>
      </footer>

      {formOpen && (
        <StudentForm
          student={editingStudent}
          existingStudents={students}
          onClose={() => { setFormOpen(false); setEditingStudent(null) }}
          onSubmit={handleSave}
        />
      )}
    </main>
  )
}

export default App
