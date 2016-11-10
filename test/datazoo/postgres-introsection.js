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
const extend = require('../utils/extend');
const extractConfig = require('../utils/extract-config');
const basicString = require('../utils/basic-string');

const TEST_PORT = 18082;
var pivotServer;

describe('datazoo postgres introspection', function () {
  this.timeout(5000);

  before((done) => {
    pivotServer = spawnServer(`bin/pivot --postgres 192.168.99.100 --database datazoo --user root --password datazoo -p ${TEST_PORT}`);
    pivotServer.onHook('Pivot is listening on address', done);
  });

  it('works with GET /', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(pivotServer.getStderr()).to.equal('');
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = extractConfig(body);
      var dataCubes = config.appSettings.dataCubes;
      expect(dataCubes).to.have.length(2);
      var wikiDataSource = dataCubes[0].name === 'wikipedia' ? dataCubes[0] : dataCubes[1];

      expect(wikiDataSource.name).to.equal('wikipedia');

      expect(wikiDataSource.dimensions.map(basicString)).to.deep.equal([
        "sometimeLater ~ $sometimeLater",
        "time ~ $time",
        "channel ~ $channel",
        "cityName ~ $cityName",
        "comment ~ $comment",
        "commentLengthStr ~ $commentLengthStr",
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
    pivotServer.kill();
  });

});
