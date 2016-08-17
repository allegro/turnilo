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
const spawnServer = require('node-spawn-server');
const mockDruid = require('../utils/mock-druid');
const extractConfig = require('../utils/extract-config');

const TEST_PORT = 18082;
var pivotServer;
var druidServer;

var wikipediaSegmentMetadataResponse = [
  {
    "id": "lol",
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

var githubSegmentMetadataResponse = [
  {
    "id": "lol",
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
      "repo": {
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

var hasData = false;
function startDruid(callback) {
  return mockDruid({
    onDataSources: function() {
      if (hasData) {
        return {
          json: ['wikipedia', 'github']
        }
      } else {
        return {
          json: []
        }
      }
    },
    onQuery: function(query) {
      if (!hasData) {
        return {
          json: []
        }
      }

      switch (query.queryType) {
        case 'segmentMetadata':
          switch (query.dataSource) {
            case 'wikipedia':
              return {
                json: wikipediaSegmentMetadataResponse
              };

            case 'github':
              return {
                json: githubSegmentMetadataResponse
              };

            default:
              return {
                json: []
              };
          }

        case 'timeBoundary':
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
  }, callback);
}

describe('many datasources', function () {
  this.timeout(30000);

  before((done) => {
    pivotServer = spawnServer(`bin/pivot -c test/configs/two-little-datasources.yaml -p ${TEST_PORT}`, {
      env: {
        DRUID_HOST: 'localhost:28082'
      }
    });

    pivotServer.onHook('Pivot is listening on address', done);
  });

  it('works with GET / before Druid start', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = extractConfig(body);
      expect(config.appSettings.dataCubes.length);

      testComplete();
    });
  });

  it('works with GET / after Druid start (no data)', (testComplete) => {
    druidServer = startDruid((err, port) => {
      if (err) testComplete(err);

      // timeout needed for now because pivot only check connectivity every 20s
      setTimeout(() => {
        request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(200);
          expect(body).to.contain('<!DOCTYPE html>');
          expect(body).to.contain('<title>Pivot');
          expect(body).to.contain('<div class="app-container"></div>');
          expect(body).to.contain('</html>');

          var config = extractConfig(body);
          expect(config.appSettings.dataCubes.map((d) => d.name)).to.deep.equal([]);

          hasData = true;

          request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body).to.contain('<!DOCTYPE html>');
            expect(body).to.contain('<title>Pivot');
            expect(body).to.contain('<div class="app-container"></div>');
            expect(body).to.contain('</html>');

            var config = extractConfig(body);
            expect(config.appSettings.dataCubes.map((d) => d.name)).to.deep.equal(["wiki", "github"]);

            testComplete();
          });
        });
      }, 21000);

    });
  });

  after(() => {
    pivotServer.kill();
    druidServer.kill();
  });

});
