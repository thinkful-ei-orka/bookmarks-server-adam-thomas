require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV}=require('./config');
const winston = require('winston');
const bookmarksRouter = require('./bookmarksRouter');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

const apiToken = process.env.API_TOKEN;
function handleBearerToken(req, res, next) {
  const authToken = req.get('Authorization') || ' ';
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(400).json({ error: 'No valid bearer token provided' });
  }
  if (authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  next();
}

app.use(handleBearerToken);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.use('/bookmarks',bookmarksRouter);

app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production'){
    response = {error: {message: 'server error'}};
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;