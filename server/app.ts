'use strict';

import * as express from 'express';
import { Request, Response } from 'express';

import * as path from 'path';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as handlebars from 'express-handlebars';

import { Timezone, WallTime } from "chronology";
// Init chronology
if (!WallTime.rules) {
  var tzData = require("chronology/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var app = express();

const SECRET = 'Always wring a secret Towel, to surprise the enemy.';
const VERSION = 'v1.1';

app.disable('x-powered-by');

// view engine setup
app.engine('.hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, '../views/layouts/'),
  partialsDir: path.join(__dirname, '../views/partials/')
}));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../favicon')));
app.use(express.static(path.join(__dirname, '../data')));

app.get('/', (req: Request, res: Response, next: Function) => {
  res.render('explorer', {
    version: VERSION,
    title: 'Explorer'
  });
});

//catch 404 and forward to error handler
app.use((req: Request, res: Response, next: Function) => {
  var err = new Error('Not Found');
  (<any>err)['status'] = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') { // NODE_ENV

  app.use((err: any, req: Request, res: Response, next: Function) => {
    res.status(err['status'] || 500);
    res.render('error', {
      message: err.message,
      error: err,
      version: VERSION,
      title: 'Explorer Error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req: Request, res: Response, next: Function) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    version: VERSION,
    title: 'Explorer Error'
  });
});

export = app;
