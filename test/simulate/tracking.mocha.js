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
const Q = require('q');
const request = require('request');
const plywood = require('plywood');
const spawnServer = require('../utils/spawn-server');
const eventCollector = require('../utils/event-collector');

const $ = plywood.$;

const TEST_PORT = 18082;
var pivotServer;
var eventCollectorServer;

describe('tracking', function () {
  this.timeout(15000);

  before((done) => {
    eventCollectorServer = eventCollector({}, (err, port) => {
      if (err) return done(err);

      pivotServer = spawnServer(`bin/pivot -c test/configs/tracking-static.yaml -p ${TEST_PORT}`);
      pivotServer.onHook('Pivot is listening on address', done);
    });
  });

  it('sends the right events', () => {
    return Q.nfcall(request.get, `http://localhost:${TEST_PORT}/health`)
      .then((res) => {
        var response = res[0];
        expect(response.statusCode).to.equal(200);
        return Q.nfcall(request.get, `http://localhost:${TEST_PORT}/`);
      })
      .then((res) => {
        var response = res[0];
        expect(response.statusCode).to.equal(200);

        var body = res[1];
        expect(body).to.contain('<title>Pivot');

        return Q.nfcall(request.post, {
          url: `http://localhost:${TEST_PORT}/plywood`,
          json: {
            dataCube: 'wiki',
            timezone: 'Etc/UTC',
            expression: $('main').split('$channel', 'Channel')
              .apply('Added', '$main.sum($added)')
              .sort('$Added', 'descending')
              .limit(3)
          }
        });
      })
      .then((res) => {
        var response = res[0];
        expect(response.statusCode).to.equal(200);

        return Q.nfcall(request.post, {
          url: `http://localhost:${TEST_PORT}/mkurl`,
          json: {
            domain: 'http://localhost:9090',
            dataCube: 'wiki',
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
        });
      })
      .then((res) => {
        var response = res[0];
        expect(response.statusCode).to.equal(200);
      })
      .delay(10000)
      .then(() => {
        var events = eventCollectorServer.getEvents();
        events = events.map(e => {
          expect(isNaN(new Date(e.timestamp))).to.equal(false);
          delete e.timestamp; // it is variable

          expect(typeof e.value).to.equal('number');
          delete e.value; // it is variable

          expect(typeof e.version).to.equal('string');
          delete e.version; // it is variable

          return e;
        });

        expect(events).to.deep.equal([
          {
            "metric": "init",
            "service": "pivot/test",
            "something": "cool",
            "type": "pivot_init"
          },
          {
            "method": "GET",
            "metric": "request/time",
            "service": "pivot/test",
            "something": "cool",
            "status": "200",
            "type": "request",
            "url": "/health"
          },
          {
            "method": "GET",
            "metric": "request/time",
            "service": "pivot/test",
            "something": "cool",
            "status": "200",
            "type": "request",
            "url": "/"
          },
          {
            "method": "POST",
            "metric": "request/time",
            "service": "pivot/test",
            "something": "cool",
            "status": "200",
            "type": "request",
            "url": "/plywood"
          },
          {
            "method": "POST",
            "metric": "request/time",
            "service": "pivot/test",
            "something": "cool",
            "status": "200",
            "type": "request",
            "url": "/mkurl"
          }
        ]);
      })

  });

  after(() => {
    pivotServer.kill();
    eventCollectorServer.kill();
  });

});
