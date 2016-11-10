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

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { ServerSettings } from './server-settings';

describe('ServerSettings', () => {
  it('is an immutable class', () => {
    testImmutableClass(ServerSettings, [
      {},
      {
        port: 9090
      },
      {
        port: 9091
      },
      {
        port: 9091,
        trustProxy: "always"
      },
      {
        port: 9090,
        serverRoot: '/pivots',
        pageMustLoadTimeout: 900,
        iframe: 'deny'
      },
      {
        port: 9091,
        serverRoot: '/pivots',
        pageMustLoadTimeout: 901
      },
      {
        port: 9091,
        serverHost: '10.20.30.40',
        serverRoot: '/pivots',
        pageMustLoadTimeout: 901
      },
      {
        port: 9091,
        trackingUrl: 'http://mytracker-is-cool.io/trackz',
        trackingContext: {
          service: 'me'
        }
      },
      {
        port: 9091,
        auth: 'my_auth.js'
      },
      {
        port: 9091,
        settingsLocation: {
          location: 'file',
          uri: 'path/to/my/file.yaml'
        }
      }
    ]);
  });


  describe("upgrades", () => {
    it("port", () => {
      expect(ServerSettings.fromJS({
        port: ('9090' as any),
        serverRoot: '/pivots',
        pageMustLoadTimeout: 900,
        iframe: 'deny'
      }).toJS()).to.deep.equal({
        port: 9090,
        serverRoot: '/pivots',
        pageMustLoadTimeout: 900,
        iframe: 'deny'
      });
    });

  });

});
