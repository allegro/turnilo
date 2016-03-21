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

export function externalFactory(dataSource: DataSource, druidRequester: Requester.PlywoodRequester<any>, timeout: number, introspectionStrategy: string): Q.Promise<External> {
  var countDistinctReferences: string[] = [];
  if (dataSource.measures) {
    countDistinctReferences = [].concat.apply([], dataSource.measures.toArray().map((measure) => {
      return Measure.getCountDistinctReferences(measure.expression);
    }));
  }

  var context = {
    timeout
  };

  if (dataSource.introspection === 'none') {
    return Q(new DruidExternal({
      suppress: true,
      dataSource: dataSource.source,
      rollup: dataSource.rollup,
      timeAttribute: dataSource.timeAttribute.name,
      customAggregations: dataSource.options.customAggregations,
      attributes: AttributeInfo.override(dataSource.deduceAttributes(), dataSource.attributeOverrides),
      derivedAttributes: dataSource.derivedAttributes,
      introspectionStrategy,
      filter: dataSource.subsetFilter,
      context,
      requester: druidRequester
    }));
  } else {
    var introspectedExternalPromise = new DruidExternal({
      suppress: true,
      dataSource: dataSource.source,
      rollup: dataSource.rollup,
      timeAttribute: dataSource.timeAttribute.name,
      attributeOverrides: dataSource.attributeOverrides,
      derivedAttributes: dataSource.derivedAttributes,
      customAggregations: dataSource.options.customAggregations,
      introspectionStrategy,
      filter: dataSource.subsetFilter,
      context,
      requester: druidRequester
    }).introspect();

    if (!countDistinctReferences) {
      return introspectedExternalPromise;
    }

    return introspectedExternalPromise
      .then((introspectedExternal) => {
        var attributes = introspectedExternal.attributes;
        for (var attribute of attributes) {
          // This is a metric that should really be a HLL
          if (attribute.type === 'NUMBER' && countDistinctReferences.indexOf(attribute.name) !== -1) {
            introspectedExternal = introspectedExternal.updateAttribute(AttributeInfo.fromJS({
              name: attribute.name,
              special: 'unique'
            }));
          }
        }
        return introspectedExternal;
      });
  }
}

export function dataSourceFillerFactory(druidRequester: Requester.PlywoodRequester<any>, configDirectory: string, timeout: number, introspectionStrategy: string) {
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
        return externalFactory(dataSource, druidRequester, timeout, introspectionStrategy)
          .then((external) => {
            var executor = basicExecutorFactory({
              datasets: { main: external }
            });

            return dataSource.addAttributes(external.attributes).attachExecutor(executor);
          })
          .then(DataSource.updateMaxTime);

      default:
        throw new Error(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
    }
  };
}
