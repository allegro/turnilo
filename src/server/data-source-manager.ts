'use strict';

import * as Q from 'q';

import { DRUID_HOST, USE_SEGMENT_METADATA, DATA_SOURCES, SOURCE_LIST_REFRESH_INTERVAL } from './config';
import { DataSource, DataSourceJS } from '../common/models/index';
import { fillInDataSource } from './utils/index';
import { druidRequesterFactory } from 'plywood-druid-requester';

var myDataSources: DataSource[] = DATA_SOURCES;

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
if (DRUID_HOST) {
  druidRequester = druidRequesterFactory({
    host: DRUID_HOST,
    timeout: 30000
  });

  //druidRequester = helper.verboseRequesterFactory({
  //  requester: druidRequester
  //});
}

function introspectDataSource(dataSource: DataSource): Q.Promise<any> {
  return fillInDataSource(dataSource, druidRequester, USE_SEGMENT_METADATA).then((filledDataSource) => {
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

    var unknownDataSourceNames = ds.filter((d: string) => {
      var existingDataSources = myDataSources.filter((dataSource) => {
        return dataSource.engine === 'druid' && dataSource.source === d;
      });

      return existingDataSources.length === 0;
    });

    if (!unknownDataSourceNames) return Q(null);

    return Q.allSettled(unknownDataSourceNames.map((name) => {
      console.log('Adding Druid data source: ' + name);
      return introspectDataSource(DataSource.fromJS({
        name,
        engine: 'druid',
        source: name,
        timeAttribute: 'time'
      }));
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
  console.log(`Initial introspection complete. Got ${myDataSources.length} data sources`);
});

if (SOURCE_LIST_REFRESH_INTERVAL) {
  console.log(`Will refresh data sources every ${SOURCE_LIST_REFRESH_INTERVAL}ms`);
  setInterval(loadDruidDataSources, SOURCE_LIST_REFRESH_INTERVAL);
}

export function getDataSources(): Q.Promise<DataSource[]> {
  return initialLoad.then(() => {
    if (myDataSources.length) return myDataSources;

    // There are no data sources... lets try to load some:
    return loadDruidDataSources().then(() => {
      return myDataSources; // we tried
    });
  });
}
