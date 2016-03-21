import * as Q from 'q';
import { Duration, Timezone } from 'chronoshift';
import { $, AttributeInfo, RefExpression, DruidExternal, helper } from 'plywood';
import { DataSource, DataSourceJS, RefreshRule, Dimension, Measure } from '../../../common/models/index';

export type SourceListScan = "disable" | "auto";

export interface DataSourceFiller {
  (dataSource: DataSource): Q.Promise<DataSource>;
}

export interface DataSourceManagerOptions {
  dataSources?: DataSource[];
  dataSourceStubFactory?: (name: string) => DataSource;
  druidRequester?: Requester.PlywoodRequester<any>;
  dataSourceFiller?: DataSourceFiller;
  sourceListScan?: SourceListScan;
  sourceListRefreshInterval?: number;
  sourceListRefreshOnLoad?: boolean;
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
    dataSourceFiller,
    sourceListScan,
    sourceListRefreshOnLoad,
    sourceListRefreshInterval,
    log
  } = options;

  if (!sourceListScan) sourceListScan = 'auto';
  if (sourceListScan !== 'disable' && sourceListScan !== 'auto') {
    throw new Error(`sourceListScan must be disable or auto is ('${sourceListScan}')`);
  }

  if (!dataSourceStubFactory) {
    dataSourceStubFactory = (name: string) => {
      return DataSource.fromJS({
        name,
        engine: 'druid',
        source: name,
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
    myDataSources = helper.overrideByName(myDataSources, [dataSource]);
  }

  function introspectDataSource(dataSource: DataSource): Q.Promise<any> {
    return dataSourceFiller(dataSource)
      .then((filledDataSource) => {
        addOrUpdateDataSource(filledDataSource);

        var issues = filledDataSource.getIssues();
        if (issues.length) {
          log(`Data source '${filledDataSource.name}' has the following issues:`);
          log('- ' + issues.join('\n- ') + '\n');
        }
      })
      .catch((e) => {
        log(`Failed to introspect data source: '${dataSource.name}' because ${e.message}`);
      });
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

        nonQueryableDataSources = nonQueryableDataSources.concat(unknownDataSourceNames.map((name) => {
          var newDataSource = dataSourceStubFactory(name);
          log(`Adding Druid data source: '${name}'`);
          addOrUpdateDataSource(newDataSource);
          return newDataSource;
        }));

        // Nothing to do
        if (!nonQueryableDataSources.length) return Q(null);

        return Q.allSettled(nonQueryableDataSources.map((dataSource) => {
          return introspectDataSource(dataSource);
        }));
      })
      .catch((e: Error) => {
        log(`Could not get druid source list: ${e.message}`);
      });
  }

  // First concurrently introspect all the defined data sources
  var initialLoad: Q.Promise<any> = Q.allSettled(myDataSources.map(introspectDataSource));

  // Then (if needed) scan for more data sources
  if (sourceListScan === 'auto' && druidRequester) {
    initialLoad = initialLoad.then(loadDruidDataSources);
  }

  // Then print out an update
  initialLoad.then(() => {
    var queryableDataSources = getQueryable();
    log(`Initial introspection complete. Got ${myDataSources.length} data sources, ${queryableDataSources.length} queryable`);
  });

  if (sourceListScan === 'auto' && druidRequester && sourceListRefreshInterval) {
    log(`Will refresh data sources every ${sourceListRefreshInterval}ms`);
    setInterval(loadDruidDataSources, sourceListRefreshInterval).unref();
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

  return {
    getDataSources: () => {
      return initialLoad.then(() => {
        if (myDataSources.length && !sourceListRefreshOnLoad) return myDataSources;

        // There are no data sources... lets try to load some:
        return loadDruidDataSources().then(() => {
          return myDataSources; // we tried
        });
      });
    },

    getQueryableDataSources: () => {
      return initialLoad.then(() => {
        var queryableDataSources = getQueryable();
        if (queryableDataSources.length && !sourceListRefreshOnLoad) return queryableDataSources;

        // There are no data sources... lets try to load some:
        return loadDruidDataSources().then(() => {
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
