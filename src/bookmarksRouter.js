const express = require('express');
const morgan = require('morgan');
const bookmarksRouter = express.Router();
const {v4:uuid}=require('uuid');
const BookmarksService = require('./bookmarks-service');
const Store = require('./Store.js');
const xss = require('xss');


bookmarksRouter.get('/',(req,res,next)=>{
  const knexInstance=req.app.get('db');
  BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks=>{res.json(bookmarks);})
    .catch(next);
});

bookmarksRouter.get('/:id',(req,res,next)=>{
  const knexInstance=req.app.get('db');
  BookmarksService.getById(knexInstance,req.params.id)
    .then(bookmark=>{
      if(!bookmark){
        return res.status(404).json({
          error: {message:'Bookmark doesn\'t exist'}
        });
      }
      res.json({
        id:bookmark.id,
        title:bookmark.title,
        url:bookmark.url,
        description:bookmark.description||'',
        rating:bookmark.rating
      });
    })
    .catch(next);
});

bookmarksRouter.post('/',(req,res,next)=>{
  const knexInstance=req.app.get('db')
  const {title,url,description,rating}=req.body;
  const newBookmark = {title,url,description,rating};
  for (const [key,value] of Object.entries(newBookmark)){
    if(value==null){
      return res.status(400).json({error:{message:`${key} required`}});
    }
  }
  newBookmark.rating=Number(newBookmark.rating);
  BookmarksService.insertBookmark(knexInstance,newBookmark)
    .then(bookmark=>res.status(201).location(`/bookmarks/${bookmark.id}`).json(bookmark))
    .catch(next);
});

bookmarksRouter.delete('/:id',(req,res)=>{
  const index = Store.findIndex(book=>book.id===req.params.id);
  if(index<0){
    return res.status(400).send('Bookmark does not exist');
  }
  Store.splice(index,1);
  res.status(204).send();
});


module.exports = bookmarksRouter;

