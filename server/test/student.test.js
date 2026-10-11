import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import Student from '../src/models/Student.js'
import { buildStudentQuery } from '../src/utils/studentQuery.js'
import { getStudentWriteError } from '../src/utils/studentErrors.js'
import { assessmentStudents } from '../src/data/assessmentStudents.js'

test('assessment seed records are unique and valid for the Student schema', async () => {
  const normalizedEmails = assessmentStudents.map(({ email }) => email.trim().toLowerCase())
  assert.equal(assessmentStudents.length, 25)
  assert.equal(new Set(normalizedEmails).size, assessmentStudents.length)

  for (const record of assessmentStudents) {
    await new Student(record).validate()
  }
})

test('student schema requires the core fields and timestamps', async () => {
  const student = new Student({})
  await assert.rejects(student.validate(), (error) => {
    assert.ok(error.errors.name)
    assert.ok(error.errors.email)
    assert.ok(error.errors.course)
    return true
  })
  assert.equal(Student.schema.options.timestamps, true)
})

test('student schema restricts placement status and declares unique normalized email', async () => {
  const student = new Student({
    name: 'Aditi Sharma',
    email: ' ADITI@EXAMPLE.EDU ',
    course: 'B.Tech CSE',
    status: 'Pending',
  })
  await assert.rejects(student.validate(), (error) => Boolean(error.errors.status))
  assert.equal(student.email, 'aditi@example.edu')
  assert.equal(Student.schema.path('email').options.unique, true)
})

test('duplicate email database errors map to HTTP 409', () => {
  assert.deepEqual(getStudentWriteError({ code: 11000 }, mongoose), {
    status: 409,
    message: 'A student with this email already exists',
  })
})

test('challenge 3: list query validates and applies search, status, and pagination', () => {
  assert.deepEqual(buildStudentQuery({ q: 'aditi', status: 'Applied', page: '2', pageSize: '5' }), {
    filter: { status: 'Applied', search: 'aditi' },
    page: 2,
    pageSize: 5,
  })
})