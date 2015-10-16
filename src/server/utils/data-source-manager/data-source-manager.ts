'use strict';

import * as Q from 'q';
import { Duration, Timezone } from 'chronoshift';
import { DataSource, DataSourceJS, RefreshRule } from '../../../common/models/index';
import { fillInDataSource } from '../executor/executor';
import { helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';

export interface DataSourceManagerOptions {
  dataSources?: DataSource[];
  druidHost?: string;
  retry?: number;
  verbose?: boolean;
  concurrentLimit?: number;
  dataSourceStubFactory?: (name: string) => DataSource;
  useSegmentMetadata?: boolean;
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
    druidHost,
    retry,
    verbose,
    concurrentLimit,
    dataSourceStubFactory,
    useSegmentMetadata,
    sourceListRefreshInterval,
    sourceListRefreshOnLoad,
    log
  } = options;

  if (!dataSourceStubFactory) {
    dataSourceStubFactory = (name: string) => {
      return DataSource.fromJS({
        name,
        engine: 'druid',
        source: name,
        timeAttribute: 'time',
        refreshRule: {
          rule: 'query',
          refresh: 'PT5M'
        }
      });
    };
  }

  useSegmentMetadata = Boolean(useSegmentMetadata);
  if (!log) log = function() {};

  var myDataSources: DataSource[] = dataSources || [];

  function findDataSource(name: string): DataSource {
    for (var myDataSource of myDataSources) {
      if (myDataSource.name === name) return myDataSource;
    }
    return null;
  }

  function getQueryable(): DataSource[] {
    return myDataSources.filter((dataSource) => dataSource.isQueryable());
  }

  // Updates the correct datasource (by name) in myDataSources
  function addOrUpdateDataSource(dataSource: DataSource): void {
    var updated = false;
    myDataSources = myDataSources.map((myDataSource) => {
      if (myDataSource.name === dataSource.name) {
        updated = true;
        return dataSource;
      } else {
        return myDataSource;
      }
    });
    if (!updated) {
      myDataSources.push(dataSource);
    }
  }

  var druidRequester: Requester.PlywoodRequester<any> = null;
  if (druidHost) {
    druidRequester = druidRequesterFactory({
      host: druidHost,
      timeout: 30000
    });

    if (retry) {
      druidRequester = helper.retryRequesterFactory({
        requester: druidRequester,
        retry: retry,
        delay: 500,
        retryOnTimeout: false
      });
    }

    if (verbose) {
      druidRequester = helper.verboseRequesterFactory({
        requester: druidRequester
      });
    }

    if (concurrentLimit) {
      druidRequester = helper.concurrentLimitRequesterFactory({
        requester: druidRequester,
        concurrentLimit: concurrentLimit
      });
    }
  }

  function introspectDataSource(dataSource: DataSource): Q.Promise<any> {
    return fillInDataSource(dataSource, druidRequester, useSegmentMetadata).then((filledDataSource) => {
      addOrUpdateDataSource(filledDataSource);
    }).catch((e) => {
      log(`Failed to introspect data source: '${dataSource.name}' because ${e.message}`);
    });
  }

  function loadDruidDataSources(): Q.Promise<any> {
    if (!druidRequester) return Q(null);

    return druidRequester({
      query: <any>{ queryType: 'sourceList' }
    }).then((ds: string[]) => {
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
    }).catch((e: Error) => {
      log(`Could not get druid source list: '${e.message}'`);
    });
  }

  var initialTasks: Array<Q.Promise<any>> = [];

  myDataSources.forEach((dataSource) => {
    initialTasks.push(introspectDataSource(dataSource));
  });
  if (druidRequester) {
    initialTasks.push(loadDruidDataSources());
  }

  var initialLoad: Q.Promise<any> = Q.allSettled(initialTasks);

  initialLoad.then(() => {
    var queryableDataSources = getQueryable();
    log(`Initial introspection complete. Got ${myDataSources.length} data sources, ${queryableDataSources.length} queryable`);
  });

  if (sourceListRefreshInterval) {
    log(`Will refresh data sources every ${sourceListRefreshInterval}ms`);
    setInterval(loadDruidDataSources, sourceListRefreshInterval);
  }

  // Periodically check if max time needs to be updated
  setInterval(() => {
    myDataSources.forEach((dataSource) => {
      if (dataSource.shouldQueryMaxTime()) {
        DataSource.updateMaxTime(dataSource).then((updatedDataSource) => {
          log(`Getting the latest MaxTime for '${updatedDataSource.name}'`);
          addOrUpdateDataSource(updatedDataSource);
        });
      }
    });
  }, 1000);

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

