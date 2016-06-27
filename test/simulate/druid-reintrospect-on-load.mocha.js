const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const mockDruid = require('../utils/mock-druid');
const extractConfig = require('../utils/extract-config');

const TEST_PORT = 18082;

var child;
var ready = false;
var stdout = '';
var stderr = '';

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

describe('druid reintrospect on load', function () {
  this.timeout(5000);

  var runSegmentMetadataRunNumber = 0;
  var expectedSegmentMetadataRunNumber = 1;

  before((done) => {
    mockDruid(28082, {
      onDataSources: function() {
        return {
          json: ['wikipedia']
        }
      },
      onQuery: function(query) {
        switch (query.queryType) {
          case 'segmentMetadata':
            expect(query.dataSource).to.equal('wikipedia');
            runSegmentMetadataRunNumber++;
            expect(runSegmentMetadataRunNumber).to.equal(expectedSegmentMetadataRunNumber);
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
    }).then(function() {
      child = spawn('bin/pivot', `-c test/configs/mock-druid-reintrospect-on-load.yaml -p ${TEST_PORT}`.split(' '));

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (!ready && stdout.indexOf(`Getting the latest MaxTime for`) !== -1) {
          ready = true;
          done();
        }
      });
    });
  });

  it('works with initial GET /', (testComplete) => {
    expect(runSegmentMetadataRunNumber, 'run SM once').to.equal(1);

    expectedSegmentMetadataRunNumber++;

    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      expect(runSegmentMetadataRunNumber).to.equal(2);

      var config = extractConfig(body);
      expect(config.appSettings.dataSources[0].dimensions).to.deep.equal([
        {
          "expression": {
            "name": "__time",
            "op": "ref"
          },
          "kind": "time",
          "name": "__time",
          "title": "Time"
        },
        {
          "expression": {
            "name": "channel",
            "op": "ref"
          },
          "kind": "string",
          "name": "channel",
          "title": "Channel"
        }
      ]);

      expect(config.appSettings.dataSources[0].measures).to.deep.equal([
        {
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "count",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "count",
          "title": "Count"
        }
      ]);

      testComplete();
    });
  });

  it('works with second GET /', (testComplete) => {
    segmentMetadataResponse[0].columns.added = {
      "type": "LONG",
      "hasMultipleValues": false,
      "size": 0,
      "cardinality": null,
      "minValue": null,
      "maxValue": null,
      "errorMessage": null
    };
    segmentMetadataResponse[0].columns.page = {
      "type": "STRING",
      "hasMultipleValues": false,
      "size": 0,
      "cardinality": 0,
      "minValue": null,
      "maxValue": null,
      "errorMessage": null
    };

    expectedSegmentMetadataRunNumber++;
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      expect(runSegmentMetadataRunNumber).to.equal(3);

      var config = extractConfig(body);
      expect(config.appSettings.dataSources[0].dimensions).to.deep.equal([
        {
          "expression": {
            "name": "__time",
            "op": "ref"
          },
          "kind": "time",
          "name": "__time",
          "title": "Time"
        },
        {
          "expression": {
            "name": "channel",
            "op": "ref"
          },
          "kind": "string",
          "name": "channel",
          "title": "Channel"
        },
        {
          "expression": {
            "name": "page",
            "op": "ref"
          },
          "kind": "string",
          "name": "page",
          "title": "Page"
        }
      ]);

      expect(config.appSettings.dataSources[0].measures).to.deep.equal([
        {
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "count",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "count",
          "title": "Count"
        },
        {
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "added",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "added",
          "title": "Added"
        }
      ]);

      testComplete();
    });
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
