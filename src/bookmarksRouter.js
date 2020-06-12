const express = require('express');
const bookmarksRouter = express.Router();
const BookmarksService = require('./bookmarks-service');
const xss = require('xss');


bookmarksRouter.get('/', (req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => { res.json(bookmarks); })
    .catch(next);
});

bookmarksRouter.get('/:id', (req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarksService.getById(knexInstance, req.params.id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: 'Bookmark doesn\'t exist' }
        });
      }
      res.json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description) || '',
        rating: bookmark.rating
      });
    })
    .catch(next);
});

bookmarksRouter.post('/', (req, res, next) => {
  const knexInstance = req.app.get('db');
  const { title, url, description, rating } = req.body;
  const newBookmark = { title, url, description, rating };
  for (const [key, value] of Object.entries(newBookmark)) {
    if (value == null) {
      return res.status(400).json({ error: { message: `${key} required` } });
    }
  }
  newBookmark.rating = Number(newBookmark.rating);
  BookmarksService.insertBookmark(knexInstance, newBookmark)
    .then(bookmark => res.status(201).location(`/bookmarks/${bookmark.id}`).json({
      id: bookmark.id,
      title: xss(bookmark.title),
      url: xss(bookmark.url),
      description: xss(bookmark.description) || '', rating: bookmark.rating
    }
    ))
    .catch(next);
});

bookmarksRouter.delete('/:id', (req, res, next) => {
  BookmarksService.getById(req.app.get('db'), req.params.id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: 'Bookmark doesn\'t exist' }
        });
      }
      BookmarksService.deleteBookmark(req.app.get('db'), bookmark.id)
        .then(() => {
          res.status(204).end();
        })
        .catch(next);
    });
});


module.exports = bookmarksRouter;