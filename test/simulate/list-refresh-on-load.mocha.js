/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const expect = require('chai').expect;
const request = require('request');
const mockDruid = require('../utils/mock-druid');
const extend = require('../utils/extend');
const spawnServer = require('../utils/spawn-server');
const extractConfig = require('../utils/extract-config');

const TEST_PORT = 18082;
var pivotServer;
var druidServer;

var segmentMetadataResponse = [
  {
    "id": "wikipedia_2015-09-12T00:00:00.000Z_2015-09-13T00:00:00.000Z_2016-06-17T19:58:57.097Z",
    "intervals": null,
    "columns": {
      "__time": {
        "type": "LONG",
        "hasMultipleValues": false,
        "size": 0,
        "cardinality": null,
        "minValue": null,
        "maxValue": null,
        "errorMessage": null
      },
      "count": {
        "type": "LONG",
        "hasMultipleValues": false,
        "size": 0,
        "cardinality": null,
        "minValue": null,
        "maxValue": null,
        "errorMessage": null
      },
      "channel": {
        "type": "STRING",
        "hasMultipleValues": false,
        "size": 0,
        "cardinality": 0,
        "minValue": null,
        "maxValue": null,
        "errorMessage": null
      }
    },
    "size": 0,
    "numRows": 390982,
    "aggregators": {
      "count": {
        "type": "longSum",
        "name": "count",
        "fieldName": "count"
      }
    }
  }
];

describe('list refresh on load with datasource', function () {
  this.timeout(5000);

  var dataLoaded = false;

  before((done) => {
    druidServer = mockDruid({
      onDataSources: function() {
        return {
          json: dataLoaded ? ['wikipedia'] : []
        }
      },
      onQuery: function(query) {
        if (!dataLoaded) {
          return {
            json: []
          };
        }

        switch (query.queryType) {
          case 'segmentMetadata':
            expect(query.dataSource).to.equal('wikipedia');
            return {
              json: segmentMetadataResponse
            };

          case 'timeBoundary':
            expect(query.dataSource).to.equal('wikipedia');
            return {
              json: [
                {
                  "timestamp": "2015-09-12T23:59:00.000Z",
                  "result": {
                    "maxTime": "2015-09-12T23:59:00.000Z"
                  }
                }
              ]
            };

          default:
            throw new Error(`unknown query ${query.queryType}`);
        }
      }
    }, function(err, port) {
      if (err) return done(err);

      pivotServer = spawnServer(`bin/pivot -c test/configs/list-refresh-on-load-datasource.yaml -p ${TEST_PORT}`, {
        env: {
          DRUID_HOST: `localhost:${port}`
        }
      });

      pivotServer.onHook(`Cluster 'druid' could not introspect 'wiki' because: No such datasource`, done);
    });
  });

  it('works with GET / when no data available', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = extractConfig(body);
      expect(config.appSettings.dataCubes.map((ds) => ds.name)).to.deep.equal([]);

      testComplete();
    });
  });

  it('works with GET / once data becomes available', (testComplete) => {
    dataLoaded = true;

    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      expect(pivotServer.getStdall()).to.contain("Cluster 'druid' has never seen 'wikipedia' and will introspect 'wiki");

      var config = extractConfig(body);
      expect(config.appSettings.dataCubes.map((ds) => ds.name)).to.deep.equal(['wiki']);

      testComplete();
    });
  });

  after(() => {
    pivotServer.kill();
    druidServer.kill();
  });

});
