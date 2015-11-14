'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Colors } from './colors';

describe('Colors', () => {
  it('is an immutable class', () => {
    testImmutableClass(Colors, [
      {
        dimension: 'country',
        limit: 5
      },
      {
        dimension: 'country',
        values: { '1': 'USA', '3': 'UK', '7': 'India' }
      },
      {
        dimension: 'country',
        values: { '1': 'USA', '3': 'UK', '8': 'India' }
      },
      {
        dimension: 'country',
        values: { '0': 'USA', '1': 'UK', '2': 'India' }
      },
      {
        dimension: 'country',
        values: { '0': 'USA', '1': 'UK', '2': 'India' },
        sameAsLimit: true
      }
    ]);
  });

  describe('workflow', () => {
    it('start, set values, add, remove, toggle', () => {
      var initColors = Colors.init('country', 5);
      var colors = initColors;

      expect(colors.toJS()).to.deep.equal({
        dimension: 'country',
        limit: 5
      });

      colors = colors.setValueEquivalent(['USA', 'UK', 'India', 'Russia', 'Madagascar']);

      expect(colors.toJS()).to.deep.equal({
        "dimension": "country",
        "sameAsLimit": true,
        "values": {
          "0": "USA",
          "1": "UK",
          "2": "India",
          "3": "Russia",
          "4": "Madagascar"
        }
      });

      expect(colors.equivalent(initColors)).to.equal(true);
      expect(initColors.equivalent(colors)).to.equal(true);

      expect(colors.hasValue('South Africa')).to.equal(false);

      colors = colors.addValue('South Africa');

      expect(colors.hasValue('South Africa')).to.equal(true);

      expect(colors.toJS()).to.deep.equal({
        "dimension": "country",
        "values": {
          "0": "USA",
          "1": "UK",
          "2": "India",
          "3": "Russia",
          "4": "Madagascar",
          "5": "South Africa"
        }
      });

      colors = colors.removeValue('UK');

      expect(colors.toJS()).to.deep.equal({
        "dimension": "country",
        "values": {
          "0": "USA",
          "2": "India",
          "3": "Russia",
          "4": "Madagascar",
          "5": "South Africa"
        }
      });

      colors = colors.addValue('Australia');

      expect(colors.toJS()).to.deep.equal({
        "dimension": "country",
        "values": {
          "0": "USA",
          "1": "Australia",
          "2": "India",
          "3": "Russia",
          "4": "Madagascar",
          "5": "South Africa"
        }
      });
    });
  });

});
