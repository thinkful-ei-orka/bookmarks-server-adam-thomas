const express = require('express');
const morgan = require('morgan');
const bookmarksRouter = express.Router();
const {v4:uuid}=require('uuid');
const Store = require('./Store.js');


bookmarksRouter.get('/',(req,res)=>{
  res.json(Store);
});

bookmarksRouter.get('/:id',(req,res)=>{
  const bookmark = Store.find(book=>book.id===req.params.id);
  if(!bookmark){
    res.status(400).send('Bookmark does not exist');
  }
  res.json(bookmark);
});

bookmarksRouter.post('/',(req,res)=>{
  const {title,url,desc,rating}=req.body;
  if(!title){
    return res.status(400).send('Title required');
  }
  if(!url){
    return res.status(400).send('Url required');
  }
  if(!desc){
    return res.status(400).send('Description (desc) required');
  }
  if(!rating){
    return res.status(400).send('Rating required');
  }
  let newBookmark = {id:uuid(),title,url,desc,rating:Number(rating)};
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

