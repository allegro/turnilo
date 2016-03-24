import * as path from 'path';
import * as fs from 'fs-promise';
import * as Q from 'q';
import { ply, $, Expression, ExpressionJS, RefExpression, ChainExpression, External, DruidExternal, Datum, Dataset, TimeRange,
         basicExecutorFactory, Executor, AttributeJSs, AttributeInfo, Attributes, PseudoDatum } from 'plywood';
import { DataSource, Dimension, Measure } from '../../../common/models/index';
import { parseData } from '../../../common/utils/parser/parser';


export function getFileData(filePath: string): Q.Promise<any[]> {
  return fs.readFile(filePath, 'utf-8')
    .then((fileData) => {
      try {
        return parseData(fileData, path.extname(filePath));
      } catch (e) {
        throw new Error(`could not parse '${filePath}': ${e.message}`);
      }
    })
    .then((fileJSON) => {
      fileJSON.forEach((d: PseudoDatum) => {
        d['time'] = new Date(d['time']);
      });
      return fileJSON;
    });
}

export function dataSourceLoaderFactory(druidRequester: Requester.PlywoodRequester<any>, configDirectory: string, timeout: number, introspectionStrategy: string) {
  return function(dataSource: DataSource): Q.Promise<DataSource> {
    switch (dataSource.engine) {
      case 'native':
        // Do not do anything if the file was already loaded
        if (dataSource.executor) return Q(dataSource);

        if (!configDirectory) {
          throw new Error('Must have a config directory');
        }

        var filePath = path.resolve(configDirectory, dataSource.source);
        return getFileData(filePath)
          .then((rawData) => {
            var dataset = Dataset.fromJS(rawData).hide();
            dataset.introspect();

            if (dataSource.subsetFilter) {
              dataset = dataset.filter(dataSource.subsetFilter.getFn(), {});
            }

            var executor = basicExecutorFactory({
              datasets: { main: dataset }
            });

            return dataSource.addAttributes(dataset.attributes).attachExecutor(executor);
          });

      case 'druid':
        return dataSource.createExternal(druidRequester, introspectionStrategy, timeout).introspect()
          .then(dataSourceWithExternal => {
            if (dataSourceWithExternal.shouldUpdateMaxTime()) {
              return DataSource.updateMaxTime(dataSourceWithExternal);
            } else {
              return dataSourceWithExternal;
            }
          });

      default:
        throw new Error(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
    }
  };
}
