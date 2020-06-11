const express = require('express');
const morgan = require('morgan');
const bookmarksRouter = express.Router();
const {v4:uuid}=require('uuid');
const BookmarksService = require('./bookmarks-service');
const Store = require('./Store.js');


bookmarksRouter.get('/',(req,res,next)=>{
  const knexInstance=req.app.get('db');
  BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmark=>{res.json(bookmark);})
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

bookmarksRouter.post('/',(req,res)=>{
  const {title,url,description,rating}=req.body;
  if(!title){
    return res.status(400).send('Title required');
  }
  if(!url){
    return res.status(400).send('Url required');
  }
  if(!description){
    return res.status(400).send('Description required');
  }
  if(!rating){
    return res.status(400).send('Rating required');
  }
  let newBookmark = {id:uuid(),title,url,description,rating:Number(rating)};
  Store.push(newBookmark);
  res.status(201).send('Post performed');
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

