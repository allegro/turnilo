import * as path from 'path';
import * as fs from 'fs-promise';
import * as Q from 'q';
import { ply, $, Expression, ExpressionJS, RefExpression, ChainExpression, External, DruidExternal, Datum, Dataset, TimeRange,
         basicExecutorFactory, Executor, AttributeJSs, AttributeInfo, Attributes } from 'plywood';
import { DataSource, Dimension } from '../../../common/models/index';
import { parseData } from '../../../common/utils/parser/parser';


function getReferences(ex: Expression): string[] {
  var references: string[] = [];
  ex.forEach((ex: Expression) => {
    if (ex instanceof RefExpression) {
      references.push(ex.name);
    }
  });
  return references;
}

/**
 * Look for all instances of countDistinct($blah) and return the blahs
 * @param ex
 * @returns {string[]}
 */
function getCountDistinctReferences(ex: Expression): string[] {
  var references: string[] = [];
  ex.forEach((ex: Expression) => {
    if (ex instanceof ChainExpression) {
      var actions = ex.actions;
      for (var action of actions) {
        if (action.action === 'countDistinct') {
          var refExpression = action.expression;
          if (refExpression instanceof RefExpression) references.push(refExpression.name);
        }
      }
    }
  });
  return references;
}

/**
 * This function tries to deduce the structure of the dataSource based on the dimensions and measures defined within.
 * It should only be used when, for some reason, introspection if not available.
 * @param dataSource
 * @returns {Attributes}
 */
function deduceAttributes(dataSource: DataSource): Attributes {
  var attributeJSs: AttributeJSs = [];

  var timeAttribute = dataSource.timeAttribute;
  if (timeAttribute) {
    attributeJSs.push({ name: timeAttribute.name, type: 'TIME' });
  }

  dataSource.dimensions.forEach((dimension) => {
    var expression = dimension.expression;
    if (expression.equals(timeAttribute)) return;
    var references = getReferences(expression);
    for (var reference of references) {
      if (reference === 'main') continue;
      attributeJSs.push({ name: reference, type: 'STRING' });
    }
  });

  dataSource.measures.forEach((measure) => {
    var expression = measure.expression;
    var references = getReferences(expression);
    var countDistinctReferences = getCountDistinctReferences(expression);
    for (var reference of references) {
      if (reference === 'main') continue;
      if (countDistinctReferences.indexOf(reference) !== -1) {
        attributeJSs.push({ name: reference, special: 'unique' });
      } else {
        attributeJSs.push({ name: reference, type: 'NUMBER' });
      }
    }
  });

  var attributes = AttributeInfo.fromJSs(attributeJSs);
  if (dataSource.attributeOverrides.length) {
    attributes = AttributeInfo.applyOverrides(attributes, dataSource.attributeOverrides);
  }

  return attributes;
}

export function getFileData(filePath: string): Q.Promise<any[]> {
  return fs.readFile(filePath, 'utf-8').then((fileData) => {
    try {
      return parseData(fileData, path.extname(filePath));
    } catch (e) {
      throw new Error(`could not parse '${filePath}': ${e.message}`);
    }
  }).then((fileJSON) => {
    fileJSON.forEach((d: Datum, i: number) => {
      d['time'] = new Date(d['time']);
    });
    return fileJSON;
  });
}

export function externalFactory(dataSource: DataSource, druidRequester: Requester.PlywoodRequester<any>, timeout: number, introspectionStrategy: string): Q.Promise<External> {
  var countDistinctReferences: string[] = [];
  if (dataSource.measures) {
    countDistinctReferences = [].concat.apply([], dataSource.measures.toArray().map((measure) => {
      return getCountDistinctReferences(measure.expression);
    }));
  }

  var context = {
    timeout
  };

  if (dataSource.introspection === 'none') {
    return Q(new DruidExternal({
      suppress: true,
      dataSource: dataSource.source,
      timeAttribute: dataSource.timeAttribute.name,
      customAggregations: dataSource.options['customAggregations'],
      attributes: AttributeInfo.applyOverrides(deduceAttributes(dataSource), dataSource.attributeOverrides),
      introspectionStrategy,
      filter: dataSource.subsetFilter,
      context,
      requester: druidRequester
    }));
  } else {
    var introspectedExternalPromise = new DruidExternal({
      suppress: true,
      dataSource: dataSource.source,
      timeAttribute: dataSource.timeAttribute.name,
      attributeOverrides: dataSource.attributeOverrides,
      customAggregations: dataSource.options['customAggregations'],
      introspectionStrategy,
      filter: dataSource.subsetFilter,
      context,
      requester: druidRequester
    }).introspect();

    if (!countDistinctReferences) {
      return introspectedExternalPromise;
    }

    return introspectedExternalPromise.then((introspectedExternal) => {
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
        return getFileData(filePath).then((rawData) => {
          var dataset = Dataset.fromJS(rawData).hide();
          dataset.introspect();

          if (dataSource.subsetFilter) {
            dataset = dataset.filter(dataSource.subsetFilter.getFn(), {});
          }

          var executor = basicExecutorFactory({
            datasets: { main: dataset }
          });

          return dataSource.setAttributes(dataset.attributes).attachExecutor(executor);
        });

      case 'druid':
        return externalFactory(dataSource, druidRequester, timeout, introspectionStrategy).then((external) => {
          var executor = basicExecutorFactory({
            datasets: { main: external }
          });

          return dataSource.setAttributes(external.attributes).attachExecutor(executor);
        }).then(DataSource.updateMaxTime);

      default:
        throw new Error(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
    }
  };
}
