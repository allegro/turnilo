import { Router, Request, Response } from 'express';
import { $, Expression, ChainExpression, RefExpression, External, Datum, Dataset, TimeRange, ApplyAction } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { DataSource } from '../../../common/models/index';

var router = Router();

interface PlyqlOutputFunctions {
  [key: string]: (data: Dataset) => string;
  json: (data: Dataset) => string;
  csv: (data: Dataset) => string;
  tsv: (data: Dataset) => string;
}

var outputFunctions: PlyqlOutputFunctions = {
  json: (data: Dataset): string => { return JSON.stringify(data, null, 2); },
  csv: (data: Dataset): string => { return data.toCSV(); },
  tsv: (data: Dataset): string => { return data.toTSV(); }
};

router.post('/', (req: PivotRequest, res: Response) => {
  var { version, outputType, query } = req.body;

  if (version !== VERSION) {
    res.status(400).send({
      error: 'incorrect version',
      action: 'reload'
    });
    return;
  }

  if (typeof query !== "string") {
    var errmsg = "Query must be a string";
    res.status(400).send(errmsg);
    return;
  }

  try {
    var parsedSQL = Expression.parseSQL(query);
  } catch (e) {
    var errmsg = "Could not parse query as SQL: " + e.message;
    res.status(400).send(errmsg);
    return;
  }

  if (typeof outputType !== "string") {
    outputType = "json";
  }

  var outputFn: (data: Dataset) => string;
  outputFn = outputFunctions[outputType];
  if (outputFn === undefined) {
    var errmsg = "Invalid output type: " + outputType;
    res.status(400).send(errmsg);
    return;
  }

  var parsedQuery = parsedSQL.expression;
  var dataSourceName = parsedSQL.table;
  if (!dataSourceName) {
    var errmsg = "Could not determine data source name";
    res.status(400).send(errmsg);
    return;
  }

  parsedQuery = parsedQuery.substitute((ex) => {
    if (ex instanceof RefExpression && ex.name === dataSourceName) {
      return $("main");
    }
    return null;
  });

  req.dataSourceManager.getQueryableDataSource(dataSourceName)
    .then((myDataSource) => {
      if (!myDataSource) {
        res.status(400).send({ error: 'unknown data source' });
        return;
      }

      myDataSource.executor(parsedQuery).then(
        (data: Dataset) => {
          res.type(outputType);
          res.send(outputFn(Dataset.fromJS(data.toJS())));
        },
        (error: Error) => {
          res.status(500).send(`got error ${error.message}`);
        }
      );
    })
    .done();

});

export = router;
