import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { Cluster } from './cluster';

describe('Cluster', () => {
  it('is an immutable class', () => {
    testImmutableClass(Cluster, [
      {
        name: 'my-druid-cluster',
        type: 'druid',
        host: '192.168.99.100',
        version: '0.9.1',
        timeout: 30000,
        sourceListScan: 'auto',
        sourceListRefreshOnLoad: true,
        sourceListRefreshInterval: 10000,
        sourceReintrospectInterval: 10000,

        introspectionStrategy: 'segment-metadata-fallback'
      },
      {
        name: 'my-mysql-cluster',
        type: 'mysql',
        host: '192.168.99.100',
        timeout: 30000,
        sourceListScan: 'auto',
        sourceListRefreshInterval: 10000,
        sourceReintrospectOnLoad: true,
        sourceReintrospectInterval: 10000,

        database: 'datazoo',
        user: 'datazoo-user',
        password: 'koalas'
      }
    ]);
  });

});
