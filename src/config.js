module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:process.env.NODE_ENV==='test'?(process.env.TEST_DB_URL || 'postgresql://postgres@localhost/bookmarks_test'):(process.env.DB_URL || 'postgresql://postgres@localhost/bookmarks')
};