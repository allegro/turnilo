'use strict';

import * as express from 'express';
import { Request, Response } from 'express';

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

import { VERSION, DATA_SOURCE_MANAGER } from './config';
import * as plywoodRoutes from './routes/plywood/plywood';

var app = express();
app.disable('x-powered-by');

// view engine setup
const viewsDir = path.join(__dirname, '../../src/views');
app.engine('.hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(viewsDir, 'layouts'),
  partialsDir: path.join(viewsDir, 'partials')
}));
app.set('views', viewsDir);
app.set('view engine', '.hbs');

app.use(compress());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, '../../build/public')));
app.use(express.static(path.join(__dirname, '../../assets')));

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response, next: Function) => {
  DATA_SOURCE_MANAGER.getDataSources().then((dataSources) => {
    if (dataSources.length) {
      res.render('pivot', {
        version: VERSION,
        config: JSON.stringify({ dataSources }),
        title: 'Pivot'
      });
    } else {
      res.render('no-data-sources', {
        version: VERSION,
        title: 'No Data Sources'
      });
    }
  }).done();
});

app.use('/plywood', plywoodRoutes);

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
      title: 'Error'
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
    title: 'Error'
  });
});

export = app;
