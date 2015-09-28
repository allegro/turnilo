'use strict';

import * as path from 'path';
import * as fs from 'fs-promise';
import * as Q from 'q';
import { ply, $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, Attributes, helper } from 'plywood';
import { DataSource, Dimension } from '../../../common/models/index';


function getReferences(ex: Expression): string[] {
  var references: string[] = [];
  ex.forEach((ex: Expression) => {
    if (ex instanceof RefExpression) {
      references.push(ex.name);
    }
  });
  return references;
}

function deduceAttributes(): void {
  /*
  // Right here we have the classic mega hack.
  dataSource.dimensions.forEach((dimension) => {
    attributes[dimension.name] = { type: dimension.type };
  });

  dataSource.measures.forEach((measure) => {
    var expression = measure.expression;
    var references = getReferences(expression);
    for (var reference of references) {
      if (reference === 'main') continue;
      if (JSON.stringify(expression).indexOf('countDistinct') !== -1) {
        attributes[reference] = { special: 'unique' };
      } else {
        attributes[reference] = { type: 'NUMBER' };
      }
    }
  });
  // Mega hack ends here
  */
}

export function getFileData(filePath: string): Q.Promise<any[]> {
  return fs.readFile(filePath, 'utf-8').then((fileData) => {
    if (fileData[0] === '[') {
      try {
        return JSON.parse(fileData);
      } catch (e) {
        throw new Error('could not parse ' + filePath);
      }

    } else {
      var fileLines = fileData.split('\n');
      if (fileLines[fileLines.length - 1] === '') fileLines.pop();

      return fileLines.map((line, i) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.log(`problem in line: ${i}: '${line}' of file ${filePath}`);
        }
      });
    }
  }).then((fileJSON) => {
    fileJSON.forEach((d: Datum, i: number) => {
      d['time'] = new Date(d['time']);
    });
    return fileJSON;
  });
}

export function externalFactory(dataSource: DataSource, druidRequester: Requester.PlywoodRequester<any>, useSegmentMetadata: boolean): Q.Promise<External> {
  return External.fromJS({
    engine: 'druid',
    dataSource: dataSource.source,
    timeAttribute: dataSource.timeAttribute.name,
    customAggregations: dataSource.options['customAggregations'],
    useSegmentMetadata,
    context: null,
    requester: druidRequester
  }).introspect();
}

export function fillInDataSource(dataSource: DataSource, druidRequester: Requester.PlywoodRequester<any>, useSegmentMetadata: boolean): Q.Promise<DataSource> {
  var disableAutofill = Boolean(dataSource.options['disableAutofill']);

  switch (dataSource.engine) {
    case 'native':
      // Do not do anything if the file was already loaded
      if (dataSource.executor) return Q(dataSource);

      var filePath = path.join(__dirname, '../../../../', dataSource.source);
      return getFileData(filePath).then((rawData) => {
        var dataset = Dataset.fromJS(rawData).hide();
        dataset.introspect();

        var executor = basicExecutorFactory({
          datasets: { main: dataset }
        });

        if (!disableAutofill) {
          dataSource = dataSource.addAttributes(dataset.attributes);
        }

        return dataSource.attachExecutor(executor);
      });

    case 'druid':
      return externalFactory(dataSource, druidRequester, useSegmentMetadata).then((external) => {
        var executor = basicExecutorFactory({
          datasets: { main: external }
        });

        if (!disableAutofill) {
          dataSource = dataSource.addAttributes(external.attributes);
        }

        return dataSource.attachExecutor(executor);
      }).then((dataSource) => {
        var ex = ply().apply('maxTime', $('main').max(dataSource.timeAttribute));

        return dataSource.executor(ex).then((dataset: Dataset) => {
          var maxTime = dataset.data[0]['maxTime'];
          if (!isNaN(maxTime)) {
            return dataSource.setMaxTime(maxTime);
          }
          return dataSource;
        });
      });

    default:
      throw new Error(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
  }
}
