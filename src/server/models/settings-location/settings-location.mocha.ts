import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { SettingsLocation } from './settings-location';

describe('SettingsLocation', () => {
  it('is an immutable class', () => {
    testImmutableClass(SettingsLocation, [
      {
        location: 'file',
        uri: '../private/lol.yaml'
      },
      {
        location: 'mysql',
        uri: 'mysql://root:@192.168.99.100:3306/datazoo'
      },
      {
        location: 'mysql',
        uri: 'mysql://root:@192.168.99.100:3306/datazoo',
        table: 'pivot_state'
      }
    ]);
  });

  describe('gets the right format', () => {
    it('gets yaml', () => {
      var settingsLocation = SettingsLocation.fromJS({
        location: 'file',
        uri: '../private/lol.yaml'
      });

      expect(settingsLocation.getFormat()).to.equal('yaml');
    });

  });

});
