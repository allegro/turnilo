import * as express from 'express';
import { Request, Response } from 'express';

import * as path from 'path';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import { $, Expression, Datum, Dataset } from 'plywood';

import { Timezone, WallTime } from 'chronoshift';
// Init chronoshift
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

import { PivotRequest } from './utils/index';
import { VERSION, DATA_SOURCE_MANAGER, AUTH, LINK_VIEW_CONFIG } from './config';
import * as plywoodRoutes from './routes/plywood/plywood';
import { pivotLayout, noDataSourcesLayout, errorLayout } from './views';

var app = express();
app.disable('x-powered-by');

app.use(compress());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, '../../build/public')));
app.use(express.static(path.join(__dirname, '../../assets')));

if (AUTH) {
  app.use(AUTH.auth({
    version: VERSION,
    dataSourceManager: DATA_SOURCE_MANAGER
  }));
} else {
  app.use((req: PivotRequest, res: Response, next: Function) => {
    req.user = null;
    req.dataSourceManager = DATA_SOURCE_MANAGER;
    next();
  });
}

app.use((req: PivotRequest, res: Response, next: Function) => {
  if (!req.dataSourceManager) {
    return next(new Error('no dataSourceManager'));
  }
  next();
});

app.use(bodyParser.json());

app.get('/', (req: PivotRequest, res: Response, next: Function) => {
  req.dataSourceManager.getQueryableDataSources()
    .then((dataSources) => {
      if (dataSources.length) {
        res.send(pivotLayout({
          version: VERSION,
          title: `Pivot (${VERSION})`,
          config: {
            version: VERSION,
            user: req.user,
            dataSources: dataSources.map((ds) => ds.toClientDataSource()),
            linkViewConfig: LINK_VIEW_CONFIG
          }
        }));
      } else {
        res.send(noDataSourcesLayout({
          version: VERSION,
          title: 'No Data Sources'
        }));
      }
    })
    .done();
});

app.use('/plywood', plywoodRoutes);

app.get('/health', (req: Request, res: Response, next: Function) => {
  res.send("Okay");
});

// Easter egg ( https://groups.google.com/forum/#!topic/imply-user-group/Ogks7pAnd-A )
app.get('/graph', (req: Request, res: Response, next: Function) => {
  res.send("I see you have been using Prometheus. Pivot saves you time by not asking you to type in /graph :-)");
});

// Catch 404 and redirect to /
app.use((req: Request, res: Response, next: Function) => {
  res.redirect('/');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') { // NODE_ENV
  app.use((err: any, req: Request, res: Response, next: Function) => {
    res.status(err['status'] || 500);
    res.send(errorLayout({ version: VERSION, title: 'Error' }, err.message, err));
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req: Request, res: Response, next: Function) => {
  res.status(err.status || 500);
  res.send(errorLayout({ version: VERSION, title: 'Error' }, err.message));
});

export = app;
