import * as Q from 'q';
import { Duration, Timezone } from 'chronoshift';
import { $, AttributeInfo, RefExpression, DruidExternal, helper } from 'plywood';
import { makeUrlSafeName } from "../../../common/utils/general/general";
import { DataSource, RefreshRule } from '../../../common/models/index';

export type SourceListScan = "disable" | "auto";

export interface DataSourceLoader {
  (dataSource: DataSource): Q.Promise<DataSource>;
}

export interface DataSourceManagerOptions {
  dataSources?: DataSource[];
  dataSourceStubFactory?: (source: string) => DataSource;
  dataSourceLoader?: DataSourceLoader;
  druidRequester?: Requester.PlywoodRequester<any>;

  pageMustLoadTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  log?: Function;
}

export interface DataSourceManager {
  getDataSources: () => Q.Promise<DataSource[]>;
  getQueryableDataSources: () => Q.Promise<DataSource[]>;
  getQueryableDataSource: (name: string) => Q.Promise<DataSource>;
}

export function dataSourceManagerFactory(options: DataSourceManagerOptions): DataSourceManager {
  var {
    dataSources,
    dataSourceStubFactory,
    druidRequester,
    dataSourceLoader,

    pageMustLoadTimeout,
    sourceListScan,
    sourceListRefreshOnLoad,
    sourceListRefreshInterval,
    sourceReintrospectOnLoad,
    sourceReintrospectInterval,

    log
  } = options;

  if (!pageMustLoadTimeout) pageMustLoadTimeout = 800;
  if (!sourceListScan) sourceListScan = 'auto';
  if (sourceListScan !== 'disable' && sourceListScan !== 'auto') {
    throw new Error(`sourceListScan must be disable or auto is ('${sourceListScan}')`);
  }

  if (!dataSourceStubFactory) {
    dataSourceStubFactory = (source: string) => {
      return DataSource.fromJS({
        name: makeUrlSafeName(source),
        engine: 'druid',
        source: source,
        refreshRule: RefreshRule.query().toJS()
      });
    };
  }

  if (!log) log = function() {};

  var myDataSources: DataSource[] = dataSources || [];

  function findDataSource(name: string): DataSource {
    return helper.findByName(myDataSources, name);
  }

  function getQueryable(): DataSource[] {
    return myDataSources.filter((dataSource) => dataSource.isQueryable());
  }

  // Updates the correct datasource (by name) in myDataSources
  function addOrUpdateDataSource(dataSource: DataSource): void {
    myDataSources = helper.overrideByName(myDataSources, dataSource);
  }

  function loadAndIntrospectDataSource(dataSource: DataSource): Q.Promise<DataSource> {
    return loadDataSource(dataSource)
      .then(introspectDataSource);
  }

  function loadDataSource(dataSource: DataSource): Q.Promise<DataSource> {
    return dataSourceLoader(dataSource)
      .then((loadedDataSource) => {
        addOrUpdateDataSource(loadedDataSource);
        return loadedDataSource;
      })
      .catch((e): DataSource => {
        log(`Failed to load data source: '${dataSource.name}' because ${e.message}`);
        throw e;
      });
  }

  function introspectDataSource(dataSource: DataSource, doLog = false): Q.Promise<DataSource> {
    return dataSource.introspect()
      .then((introspectedDataSource) => {
        if (introspectedDataSource !== dataSource) {
          if (doLog) log(`loaded new schema for ${dataSource.name}`);
          addOrUpdateDataSource(introspectedDataSource);

          var issues = introspectedDataSource.getIssues();
          if (issues.length) {
            log(`Data source '${introspectedDataSource.name}' has the following issues:`);
            log('- ' + issues.join('\n- ') + '\n');
          }
        }
        return introspectedDataSource;
      })
      .catch((e): DataSource => {
        log(`Failed to introspect data source: '${dataSource.name}' because ${e.message}`);
        throw e;
      });
  }

  function introspectDataSources(): Q.Promise<any> {
    return Q.allSettled(getQueryable().map((dataSource) => {
      return introspectDataSource(dataSource, true);
    }));
  }

  function loadDruidDataSources(): Q.Promise<any> {
    if (!druidRequester) return Q(null);

    return DruidExternal.getSourceList(druidRequester)
      .then((ds: string[]) => {
        if (!Array.isArray(ds)) throw new Error('invalid result from data source list');

        var unknownDataSourceNames: string[] = [];
        var nonQueryableDataSources: DataSource[] = [];
        ds.forEach((d: string) => {
          var existingDataSources = myDataSources.filter((dataSource) => {
            return dataSource.engine === 'druid' && dataSource.source === d;
          });

          if (existingDataSources.length === 0) {
            unknownDataSourceNames.push(d);
          } else {
            nonQueryableDataSources = nonQueryableDataSources.concat(existingDataSources.filter((dataSource) => {
              return !dataSource.isQueryable();
            }));
          }
        });

        nonQueryableDataSources = nonQueryableDataSources.concat(unknownDataSourceNames.map((source) => {
          var newDataSource = dataSourceStubFactory(source);
          log(`Adding Druid data source: '${source}'`);
          addOrUpdateDataSource(newDataSource);
          return newDataSource;
        }));

        // Nothing to do
        if (!nonQueryableDataSources.length) return Q(null);

        return Q.allSettled(nonQueryableDataSources.map(loadAndIntrospectDataSource));
      })
      .catch((e: Error) => {
        log(`Could not get druid source list: ${e.message}`);
      });
  }

  // First concurrently introspect all the defined data sources
  var initialLoad: Q.Promise<any> = Q.allSettled(myDataSources.map(loadAndIntrospectDataSource));

  // Then (if needed) scan for more data sources
  if (sourceListScan === 'auto' && druidRequester) {
    initialLoad = initialLoad.then(loadDruidDataSources);
  }

  // Then print out an update
  initialLoad.then(() => {
    var queryableDataSources = getQueryable();
    log(`Initial load and introspection complete. Got ${myDataSources.length} data sources, ${queryableDataSources.length} queryable`);
  });

  if (sourceListScan === 'auto' && druidRequester && sourceListRefreshInterval) {
    log(`Will refresh data source list every ${sourceListRefreshInterval}ms`);
    setInterval(loadDruidDataSources, sourceListRefreshInterval).unref();
  }

  if (druidRequester && sourceReintrospectInterval) {
    log(`Will re-introspect data sources every ${sourceReintrospectInterval}ms`);
    setInterval(introspectDataSources, sourceReintrospectInterval).unref();
  }

  // Periodically check if max time needs to be updated
  setInterval(() => {
    myDataSources.forEach((dataSource) => {
      if (dataSource.refreshRule.isQuery() && dataSource.shouldUpdateMaxTime()) {
        DataSource.updateMaxTime(dataSource).then((updatedDataSource) => {
          log(`Getting the latest MaxTime for '${updatedDataSource.name}'`);
          addOrUpdateDataSource(updatedDataSource);
        });
      }
    });
  }, 1000).unref();

  function onLoadTasks(): Q.Promise<any> {
    var tasks = <Q.Promise<any>[]>[];

    if (sourceListRefreshOnLoad) {
      tasks.push(loadDruidDataSources());
    }

    if (sourceReintrospectOnLoad) {
      tasks.push(introspectDataSources());
    }

    return Q.allSettled(tasks)
      .timeout(pageMustLoadTimeout)
      .catch(() => {
        log(`pageMustLoadTimeout (${pageMustLoadTimeout}) exceeded, loading anyways.`);
        return null;
      });
  }

  return {
    getDataSources: () => {
      return initialLoad.then(() => {
        if (myDataSources.length && !sourceListRefreshOnLoad && !sourceReintrospectOnLoad) return myDataSources;

        // There are no data sources... lets try to load some:
        return onLoadTasks().then(() => {
          return myDataSources; // we tried
        });
      });
    },

    getQueryableDataSources: () => {
      return initialLoad.then(() => {
        var queryableDataSources = getQueryable();
        if (queryableDataSources.length && !sourceListRefreshOnLoad && !sourceReintrospectOnLoad) return queryableDataSources;

        // There are no data sources... lets try to load some:
        return onLoadTasks().then(() => {
          return getQueryable(); // we tried
        });
      });
    },

    getQueryableDataSource: (name: string) => {
      return initialLoad.then(() => {
        var myDataSource = findDataSource(name);
        if (myDataSource) {
          if (myDataSource.isQueryable()) return myDataSource;

          return introspectDataSource(myDataSource).then(() => {
            var queryableDataSource = findDataSource(name);
            return (queryableDataSource && queryableDataSource.isQueryable()) ? queryableDataSource : null;
          });
        }

        // There are no data sources... lets try to load some:
        return loadDruidDataSources().then(() => {
          var queryableDataSource = findDataSource(name);
          return (queryableDataSource && queryableDataSource.isQueryable()) ? queryableDataSource : null;
        });
      });
    }
  };
}
