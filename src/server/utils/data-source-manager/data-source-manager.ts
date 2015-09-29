'use strict';

import * as Q from 'q';

import { DataSource, DataSourceJS } from '../../../common/models/index';
import { fillInDataSource } from '../executor/executor';
import { druidRequesterFactory } from 'plywood-druid-requester';

export interface DataSourceManagerOptions {
  dataSources: DataSource[];
  druidHost: string;
  useSegmentMetadata: boolean;
  sourceListRefreshInterval: number;
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
    useSegmentMetadata,
    sourceListRefreshInterval
  } = options;

  var myDataSources: DataSource[] = dataSources;

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
  function updateDataSource(dataSource: DataSource): void {
    var updated = false;
    myDataSources = myDataSources.map((myDataSource) => {
      if (myDataSource.name === dataSource.name) {
        updated = true;
        return dataSource;
      } else {
        return myDataSource;
      }
    });
    if (!updated) myDataSources.push(dataSource);
  }

  var druidRequester: Requester.PlywoodRequester<any> = null;
  if (druidHost) {
    druidRequester = druidRequesterFactory({
      host: druidHost,
      timeout: 30000
    });

    //druidRequester = helper.verboseRequesterFactory({
    //  requester: druidRequester
    //});
  }

  function introspectDataSource(dataSource: DataSource): Q.Promise<any> {
    return fillInDataSource(dataSource, druidRequester, useSegmentMetadata).then((filledDataSource) => {
      updateDataSource(filledDataSource);
    }).catch((e) => {
      console.log(`Failed to introspect data source: '${dataSource.name}' because ${e.message}`);
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
        var newDataSource = DataSource.fromJS({
          name,
          engine: 'druid',
          source: name,
          timeAttribute: 'time'
        });
        console.log('Adding Druid data source: ' + name);
        updateDataSource(newDataSource);
        return newDataSource;
      }));

      // Nothing to do
      if (!nonQueryableDataSources.length) return Q(null);

      return Q.allSettled(nonQueryableDataSources.map((dataSource) => {
        return introspectDataSource(dataSource);
      }));
    }).catch((e: Error) => {
      console.log(`Could not get druid source list: '${e.message}'`);
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
    console.log(`Initial introspection complete. Got ${myDataSources.length} data sources, ${queryableDataSources.length} queryable`);
  });

  if (sourceListRefreshInterval) {
    console.log(`Will refresh data sources every ${sourceListRefreshInterval}ms`);
    setInterval(loadDruidDataSources, sourceListRefreshInterval);
  }

  return {
    getDataSources: () => {
      return initialLoad.then(() => {
        if (myDataSources.length) return myDataSources;

        // There are no data sources... lets try to load some:
        return loadDruidDataSources().then(() => {
          return myDataSources; // we tried
        });
      });
    },

    getQueryableDataSources: () => {
      return initialLoad.then(() => {
        var queryableDataSources = getQueryable();
        if (queryableDataSources.length) return queryableDataSources;

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
            return queryableDataSource.isQueryable() ? queryableDataSource : null;
          });
        }

        // There are no data sources... lets try to load some:
        return loadDruidDataSources().then(() => {
          var queryableDataSource = findDataSource(name);
          return queryableDataSource.isQueryable() ? queryableDataSource : null;
        });
      });
    }
  };
}

