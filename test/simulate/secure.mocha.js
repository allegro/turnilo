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
const spawnServer = require('../utils/spawn-server');

const TEST_PORT = 18082;
var pivotServer;

describe('security', function () {
  this.timeout(5000);

  before((done) => {
    pivotServer = spawnServer(`bin/pivot -c test/configs/secure.yaml -p ${TEST_PORT}`);
    pivotServer.onHook('Pivot is listening on address', done);
  });

  it('works with GET /', (testComplete) => {
    request.get({
      url: `http://localhost:${TEST_PORT}/`,
      headers: {
        "X-Forwarded-For": "80.18.13.13",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
      }
    }, (err, response, body) => {
      expect(err).to.equal(null);
      expect(body).to.contain('<!DOCTYPE html>');
      expect(body).to.contain('<title>Pivot');
      expect(body).to.contain('<div class="app-container"></div>');
      expect(body).to.contain('var __CONFIG__ = {');
      expect(body).to.contain('</html>');

      expect(response.headers['strict-transport-security']).to.equal("max-age=10886400; includeSubDomains; preload");

      testComplete();
    });
  });

  after(() => {
    pivotServer.kill();
  });


});
