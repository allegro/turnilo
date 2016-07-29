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
const mockDruid = require('../utils/mock-druid');
const extend = require('../utils/extend');
const spawnServer = require('../utils/spawn-server');
const extractConfig = require('../utils/extract-config');
const basicString = require('../utils/basic-string');

const TEST_PORT = 18082;
var pivotServer;
var druidServer;

describe('druid reintrospect on load', function () {
  this.timeout(5000);

  before((done) => {
    druidServer = mockDruid({
      onDataSources: function() {
        return {
          json: ['wikipedia']
        }
      }
    }, function(err, port) {
      if (err) return done(err);

      pivotServer = spawnServer(`bin/pivot -c test/configs/introspection-none.yaml -p ${TEST_PORT}`, {
        env: {
          DRUID_HOST: `localhost:${port}`
        }
      });

      pivotServer.onHook('Pivot is listening on address', done);
    });
  });

  it('works with initial GET /', (testComplete) => {
    request.get(`http://localhost:${TEST_PORT}/`, (err, response, body) => {
      expect(err).to.equal(null);
      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('</html>');

      var config = extractConfig(body);
      var dataCubes = config.appSettings.dataCubes;
      expect(dataCubes).to.have.length(1);
      var wikiDataSource = dataCubes[0];

      expect(wikiDataSource.name).to.equal('wiki');

      expect(wikiDataSource.dimensions.map(basicString)).to.deep.equal([
        "time ~ $time",
        "is-english ~ $channel == 'en'",
        "user-number ~ $user.extract(\"(\\d+)\")",
        "user-first-letter ~ $user.substr(0, 1)",
        "channel ~ $channel",
        "channel-lookup ~ $channel.lookup('channel-lookup').fallback('LOL NO')",
        "user-letter-phonetic ~ $userChars.lookup('nato-phonetic')"
      ]);

      expect(wikiDataSource.measures.map(basicString)).to.deep.equal([
        "count ~ $main.sum($count)",
        "added ~ $main.sum($added)"
      ]);

      testComplete();
    });
  });

  after(() => {
    pivotServer.kill();
    druidServer.kill();
  });

});
