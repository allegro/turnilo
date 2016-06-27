const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const request = require('request');
const extend = require('../utils/extend');
const extractConfig = require('../utils/extract-config');
const basicString = require('../utils/basic-string');

const TEST_PORT = 18082;

var child;
var ready = false;
var stdout = '';
var stderr = '';

describe('datazoo postgres introspection', function () {
  this.timeout(5000);

  before((done) => {
    child = spawn('bin/pivot', `--postgres 192.168.99.100 --database datazoo --user root --password datazoo -p ${TEST_PORT}`.split(' '));

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
      expect(stderr).to.equal('');
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = extractConfig(body);
      var dataSources = config.appSettings.dataSources;
      expect(dataSources).to.have.length(2);
      var wikiDataSource = dataSources[1];

      expect(wikiDataSource.name).to.equal('wikipedia');

      expect(wikiDataSource.dimensions.map(basicString)).to.deep.equal([
        "sometimeLater ~ $sometimeLater",
        "time ~ $time",
        "channel ~ $channel",
        "cityName ~ $cityName",
        "comment ~ $comment",
        "countryIsoCode ~ $countryIsoCode",
        "countryName ~ $countryName",
        "isAnonymous ~ $isAnonymous",
        "isMinor ~ $isMinor",
        "isNew ~ $isNew",
        "isRobot ~ $isRobot",
        "isUnpatrolled ~ $isUnpatrolled",
        "namespace ~ $namespace",
        "page ~ $page",
        "regionIsoCode ~ $regionIsoCode",
        "regionName ~ $regionName",
        "user ~ $user",
        "userChars ~ $userChars"
      ]);

      expect(wikiDataSource.measures.map(basicString)).to.deep.equal([
        "count ~ $main.sum($count)",
        "commentLength ~ $main.sum($commentLength)",
        "deltaBucket100 ~ $main.sum($deltaBucket100)",
        "metroCode ~ $main.sum($metroCode)",
        "added ~ $main.sum($added)",
        "deleted ~ $main.sum($deleted)",
        "delta ~ $main.sum($delta)",
        "min_delta ~ $main.sum($min_delta)",
        "max_delta ~ $main.sum($max_delta)",
        "deltaByTen ~ $main.sum($deltaByTen)"
      ]);

      testComplete();
    });
  });

  after(() => {
    child.kill('SIGHUP');
  });

});
