const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sqlite3 = require('sqlite3');
const fileUpload = require('express-fileupload');

const app = express();

const indexRouter = require('./routes/index');

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'root.db'));
db.serialize(() => {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS competitions (
        place       INTEGER,
        competitor1 VARCHAR(255),
        competitor2 VARCHAR(255),
        competitor3 VARCHAR(255),
        result1     VARCHAR(255),
        result2     VARCHAR(255),
        result3     VARCHAR(255),
        active      INTEGER(1) DEFAULT 0
      )
    `
  );
});
db.close();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  createParentPath: true
}));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
