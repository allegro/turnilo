'use strict';

import * as express from 'express';
import { Request, Response } from 'express';

import { readFileSync } from 'fs';
import * as path from 'path';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as handlebars from 'express-handlebars';
import { $, Expression, Datum, Dataset } from 'plywood';

import { Timezone, WallTime } from 'chronoshift';
// Init chronoshift
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var countries = ['USA', 'UK', 'Israel'];
var cities = ['San Francisco', 'London', 'Tel Aviv', 'New York', 'Bristol', 'Kfar Saba'];
function getWikiData(): any[] {
  try {
    var wikiData = JSON.parse(readFileSync(path.join(__dirname, '../data/wikipedia.json'), 'utf-8'));
    var secInHour = 60 * 60;
    wikiData.forEach((d: Datum, i: number) => {
      d['continent'] = 'Oceana';
      d['country'] = countries[i % countries.length];
      d['city'] = cities[i % cities.length];
      d['region'] = 'North';
      d['time'] = new Date(Date.parse(d['time']) + (i % secInHour) * 1000);
    });
    return wikiData;
  } catch (e) {
    return [];
  }
}

var contexts: Lookup<Datum> = {
  wiki: {
    main: Dataset.fromJS(getWikiData()).hide()
  }
};

var app = express();

const VERSION = 'v0.1.1';

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

app.use(compress());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../favicon')));
app.use(express.static(path.join(__dirname, '../data')));

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response, next: Function) => {
  res.render('pivot', {
    version: VERSION,
    title: 'Pivot'
  });
});

app.post('/query', (req: Request, res: Response, next: Function) => {
  var { dataset, expression } = req.body;

  if (typeof dataset !== 'string') {
    res.status(400).send({ error: 'must have a string dataset' });
    return;
  }

  var context = contexts[dataset];
  if (!context) {
    res.status(400).send({ error: 'unknown dataset' });
    return;
  }

  var ex: Expression = null;
  try {
    ex = Expression.fromJS(expression);
  } catch (e) {
    res.status(400).send({
      error: 'bad expression',
      message: e.message
    });
    return;
  }

  ex.compute(context).then(
    (data: Dataset) => {
      res.send(data.toJS());
    },
    (e: Error) => {
      res.status(400).send({
        error: 'could not compute',
        message: e.message
      });
    }
  );
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
