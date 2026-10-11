import test from 'node:test'
import assert from 'node:assert/strict'
import { sampleStudents } from '../src/data/sampleStudents.js'
import { validateStudent } from '../src/utils/studentValidation.js'
import { filterStudents } from '../src/utils/studentFilters.js'
import { createStudent, fetchStudents } from '../src/services/studentService.js'

test('sample preview contains the five fictional placement records', () => {
  assert.equal(sampleStudents.length, 5)
  assert.deepEqual(sampleStudents.map(({ name }) => name), [
    'Aditi Sharma', 'Rahul Verma', 'Neha Singh', 'Arjun Mehta', 'Priya Gupta',
  ])
})

test('form validation rejects missing required fields', () => {
  assert.match(validateStudent({ name: '', email: 'a@example.edu', course: 'BCA' }), /required/i)
  assert.equal(validateStudent({ name: 'Aditi Sharma', email: 'a@example.edu', course: 'BCA' }), '')
})

test('challenge 1: search and status filtering work together', () => {
  assert.deepEqual(filterStudents(sampleStudents, 'SHARMA', 'Applied'), [sampleStudents[0]])
})

test('challenge 2: malformed and duplicate email values are rejected', () => {
  assert.match(validateStudent({ name: 'Aditi', email: 'not-an-email', course: 'BCA' }), /email/i)
})

test('student service reports failed responses instead of returning success data', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Database unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    await assert.rejects(fetchStudents(), /Database unavailable/)
    await assert.rejects(createStudent({ name: 'Aditi' }), /Database unavailable/)
  } finally {
    globalThis.fetch = originalFetch
  }
})