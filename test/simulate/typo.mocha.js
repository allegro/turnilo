const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');

const TEST_PORT = 18082;

var child;
var ready = false;
var stdout = '';
var stderr = '';

describe('typo', function () {
  this.timeout(5000);

  before((done) => {
    child = spawn('bin/pivot', `--druid 11.22.33.44 -p ${TEST_PORT}`.split(' '));

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

  it('works with GET /', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(stderr).to.contain('Settings load timeout hit, continuing');
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('"dataSources":[]');
      expect(body).to.contain('</html>');
      testComplete();
    });
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
