import { expect } from 'chai';
import { testImmutableClass } from '../../../../node_modules/immutable-class/build/tester';

import { ServerSettings } from './server-settings';

describe('ServerSettings', () => {
  it('is an immutable class', () => {
    testImmutableClass(ServerSettings, [
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
      }
      ,
      {
        port: 9091,
        serverHost: '10.20.30.40',
        serverRoot: '/pivots',
        pageMustLoadTimeout: 901
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
