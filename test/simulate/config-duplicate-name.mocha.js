const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const extend = require('../utils/extend');

const TEST_PORT = 18082;

var child;
var ready = false;
var stderr = '';
var stdout = '';

describe('config duplicate names', function () {
  this.timeout(5000);

  before((done) => {
    child = spawn('bin/pivot', `--config test/configs/duplicate-measure-dimension-name.yaml -p ${TEST_PORT}`.split(' '), {
      env: extend(process.env, {
        DRUID_HOST: '11.22.33.44:5555'
      })
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (!ready && stderr.indexOf(`Fatal settings load error:`) !== -1) {
        ready = true;
        done();
      }
    });

    // add this anyway so done is called even if error doesn't happen
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (!ready && stdout.indexOf(`Pivot is listening on address`) !== -1) {
        ready = true;
        done();
      }
    });

  });

  it('throws correct error', (testComplete) => {
    expect(stderr.indexOf(`Fatal settings load error: name 'language' found in both dimensions and measures in data source: 'wiki'`)).to.equal(0);
    testComplete();
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
