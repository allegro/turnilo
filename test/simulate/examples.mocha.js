const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const plywood = require('plywood');

const $ = plywood.$;
const ply = plywood.ply;
const r = plywood.r;

const TEST_PORT = 18082;

var child;

describe('examples', function () {
  this.timeout(5000);

  before((done) => {
    child = spawn('bin/pivot', `--examples -p ${TEST_PORT}`.split(' '));

    child.stderr.on('data', (data) => {
      throw new Error(data.toString());
    });

    child.stdout.on('data', (data) => {
      data = data.toString();
      if (data.indexOf(`Pivot is listening on address`) !== -1) {
        done();
      }
    });
  });

  it('works with GET /health', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/health`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('I am healthy @');
      testComplete();
    });
  });

  it('works with GET /', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('var __CONFIG__ = {');
      expect(body).to.contain('</html>');
      testComplete();
    });
  });

  it('works with POST /plywood', (testComplete) => {
    request({
      method: 'POST',
      url: `http://localhost:${TEST_PORT}/plywood`,
      json: {
        dataSource: 'wiki',
        timezone: 'Etc/UTC',
        expression: $('main').split('$channel', 'Channel')
          .apply('Added', '$main.sum($added)')
          .sort('$Added', 'descending')
          .limit(3)
      }
    }, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.deep.equal({
        "result": [
          {
            "Added": 3045299,
            "Channel": "en"
          },
          {
            "Added": 711011,
            "Channel": "it"
          },
          {
            "Added": 642555,
            "Channel": "fr"
          }
        ]
      });
      testComplete();
    });
  });

  it('works with POST /mkurl', (testComplete) => {
    request({
      method: 'POST',
      url: `http://localhost:${TEST_PORT}/mkurl`,
      json: {
        domain: 'http://localhost:9090',
        dataSource: 'wiki',
        essence: {
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: $('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
          pinnedDimensions: ["page"],
          singleMeasure: 'count',
          selectedMeasures: ["count", "added"],
          splits: []
        }
      }
    }, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.deep.equal({
        "url": "http://localhost:9090#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZV" +
               "yxALbVeYUmOABfZMGIRJHPOkXLOwClTqMWbFV0w58AG1JhqDYqaoA3GwFdxR5mGIMwvAEwAGAIwArAC0AaH+cL6+uFExvgB0Ub4AWjrkACY+AQ" +
               "Bs4eGR0bFRiVGpcsBgAJ5YLsBwAJIAsiAA+gBKAIIAcgDiILIycgDaALrI5I6mpvIQGI7kXshDBHMLVMTp6dSZY8tYxADm4mMTU0A=="
      });
      testComplete();
    });
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
