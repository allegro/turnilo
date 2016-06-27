const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const mockDruid = require('../utils/mock-druid');
const extend = require('../utils/extend');
const extractConfig = require('../utils/extract-config');

const TEST_PORT = 18082;

var child;
var ready = false;
var stdall = '';

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

describe('reintrospect on load with datasource', function () {
  this.timeout(5000);

  var dataLoaded = false;

  before((done) => {
    mockDruid(28089, {
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
    }).then(function() {
      child = spawn('bin/pivot', `-c test/configs/reintrospect-on-load-datasource.yaml -p ${TEST_PORT}`.split(' '), {
        env: extend(process.env, {
          DRUID_HOST: 'localhost:28089'
        })
      });

      child.stderr.on('data', (data) => {
        stdall += data.toString();
      });

      child.stdout.on('data', (data) => {
        stdall += data.toString();
        if (!ready && stdall.indexOf(`Cluster 'druid' could not introspect 'wiki' because: No such datasource`) !== -1) {
          ready = true;
          done();
        }
      });
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
      expect(config.appSettings.dataSources.map((ds) => ds.name)).to.deep.equal([]);

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

      var config = extractConfig(body);
      expect(config.appSettings.dataSources.map((ds) => ds.name)).to.deep.equal(['wiki']);

      testComplete();
    });
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
