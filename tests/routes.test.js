import test from 'tape'
import request from 'supertest'
import app from '../app/server/index.js'

test('testing env working', function (t) {
  t.equal(true, true)
  t.end()
})
test('test ping route', function (t) {
  request(app)
    .get('/api/ping')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      var expectedThings =
        { success: true }

      const actualThings = res.body

      t.error(err, 'No error')
      t.same(actualThings, expectedThings, 'Retrieve list of things')
      t.end()
    })
})

test('search by one tag', (t) => {
  request(app)
    .get('/api/posts')
    .query({ tags: 'tech' })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      var expectedThings =
        { posts: [{ id: 1, author: 'Rylee Paul', authorId: 9, likes: 960, popularity: 0.13, reads: 50361, tags: ['tech', 'health'] }] }
      const actualThings = res.body.posts

      t.equal(actualThings.filter(post => (post.id === expectedThings.posts[0].id)).length, 1)
      t.error(err, 'No error')
      // t.same(actualThings, expectedThings, 'Retrieve list of things')
      t.end()
    })
})

test('search by multiple tags', (t) => {
  request(app)
    .get('/api/posts')
    .query({ tags: 'tech, health' })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      const actualThings = res.body.posts

      t.equal(actualThings.filter(post => (post.id === 1 | post.id === 2)).length, 2)
      t.error(err, 'No error')
      // t.same(actualThings, expectedThings, 'Retrieve list of things')
      t.end()
    })
})

test('search by no tag', (t) => {
  request(app)
    .get('/api/posts')
    .query()
    .expect(400)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.equal(res.body.error, 'Tags parameter is required')
      t.error(err, { error: 'Tags parameter is required' })
      t.end()
    })
})

test('sbad sort', (t) => {
  request(app)
    .get('/api/posts')
    .query({ tags: 'tech, health', sortKey: 'foo', direction: 'bar' })
    .expect(400)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.equal(res.body.error, 'sortBy parameter is invalid')
      t.error(err, { error: 'sortBy parameter is invalid' })
      t.end()
    })
})
