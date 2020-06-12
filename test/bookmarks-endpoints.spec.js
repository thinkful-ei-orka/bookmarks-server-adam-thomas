const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function () {
  let db;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db('bookmarks').truncate());
  afterEach('cleanup', () => db('bookmarks').truncate());

  describe('GET /bookmarks', () => {
    context('Given no bookmarks', () => {
      it('responss with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, []);
      });
    });
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });
      it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, testBookmarks);
      });
    });
  });

  describe('GET /bookmarks/:id', () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkid = 2;
        return supertest(app)
          .get(`/bookmarks/${bookmarkid}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });
      it('GET /bookmarks/:id responds with 200 and the desired bookmark', () => {
        const bookmarkid = 2;
        return supertest(app)
          .get(`/bookmarks/${bookmarkid}`)
          .expect(200, testBookmarks[bookmarkid - 1]);
      });
    });
  });

  describe('POST /bookmarks', () => {
    it('appends a new bookmark to the database and responds with 201', function () {
      const newBookmark = {
        title: 'New Bookmark',
        url: 'http://www.google.com',
        description: 'description',
        rating: 3
      };
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then(postRes =>
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    const requiredFields = ['title', 'url', 'description', 'rating'];
    requiredFields.forEach(field => {
      const newBookmark = {
        title: 'new bookmark!!',
        url: 'http://www.google.com',
        description: 'woohoo!',
        rating: 3
      };
      it('responds with 400 and an error message when a field is missing', () => {
        delete newBookmark[field];
        return supertest(app)
          .post('/bookmarks')
          .send(newBookmark)
          .expect(400, { error: { message: `${field} required` } });
      });
    });
  });
  describe('DELETE /bookmarks/:id', () => {
    const removeId = 2;
    context('Given there are no articles in the database', () => {
      it("responds with 404 and bookmark doesn't exist", () => {
        return supertest(app)
          .delete(`/bookmarks/${removeId}`)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } });
      });
    });
    context('Given there are articles in the database', () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach('insert articles', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });
      it('responds with 204 and removes the article', () => {
        const expected = testBookmarks.filter(x => x.id !== removeId);
        return supertest(app)
          .delete(`/bookmarks/${removeId}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/bookmarks')
              .expect(expected)
          );
      });
    });
  });
});