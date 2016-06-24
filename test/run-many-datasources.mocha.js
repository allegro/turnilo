const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const mockDruid = require('./utils/mock-druid');
const extractConfig = require('./utils/extract-config');
const extend = require('./utils/extend');

const TEST_PORT = 18082;

var child;
var ready = false;
var stdout = '';
var stderr = '';

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

function startDruid() {
  return mockDruid(28083, {
    onStatus: function () {
      return {
        json: {
          version: '0.9.1'
        }
      }
    },
    onDataSources: function() {
      return {
        json: ['wikipedia', 'github']
      }
    },
    onQuery: function(query) {
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
  });
}

describe('run druid', function () {
  this.timeout(5000);

  before((done) => {
    child = spawn('bin/pivot', `-c test/configs/two-little-datasources.yaml -p ${TEST_PORT}`.split(' '), {
      env: extend(process.env, {
        DRUID_HOST: 'localhost:28083'
      })
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (!ready && stdout.indexOf(`Pivot is listening on address`) !== -1) {
        ready = true;
        done();
      }
    });

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
      expect(config.appSettings.dataSources.length);

      testComplete();
    });
  });

  it('works with GET / after Druid start', (testComplete) => {
    startDruid().then(() => {
      request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
        expect(err).to.equal(null);
        expect(response.statusCode).to.equal(200);
        expect(body).to.contain('<!DOCTYPE html>');
        expect(body).to.contain('<title>Pivot');
        expect(body).to.contain('<div class="app-container"></div>');
        expect(body).to.contain('</html>');

        var config = extractConfig(body);
        expect(config.appSettings.dataSources.map((d) => d.name)).to.deep.equal(["wiki", "github"]);

        testComplete();
      });

    })
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
