const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const mockDruid = require('./utils/mock-druid');

const TEST_PORT = 18082;
const DRUID_PORT = 18083;

var child;
var ready = false;
var stdout = '';
var stderr = '';

function getConfig(text) {
  var a = '<script>var __CONFIG__ = {';
  var b = '};</script>';
  var ai = text.indexOf(a);
  var bi = text.indexOf(b);
  if (ai < 0 || bi < 0) return null;
  return JSON.parse(text.substring(ai + a.length - 1, bi + 1));
}

var segmentMetadataResponce = [
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
      "added": {
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
      "added": {
        "type": "longSum",
        "name": "added",
        "fieldName": "added"
      }
    }
  }
];

describe('run druid', function () {
  this.timeout(5000);

  before((done) => {
    mockDruid(DRUID_PORT, {
      onStatus: function() {
        return {
          result: {
            version: '0.9.1'
          }
        }
      },
      onDataSources: function() {
        return {
          result: ['wikipedia']
        }
      },
      onQuery: function(query) {
        if (query.queryType === 'segmentMetadata') {
          expect(query.dataSource).to.equal('wikipedia');
          return {
            result: segmentMetadataResponce
          }

        } else {
          throw new Error('unknown query')
        }
      }
    }).then(function() {
      child = spawn('bin/pivot', `--druid localhost:${DRUID_PORT} -p ${TEST_PORT}`.split(' '));

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
  });

  it('works with GET /', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = getConfig(body);
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
