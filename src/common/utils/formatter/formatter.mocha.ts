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

import { List } from 'immutable';
import { Timezone } from 'chronoshift';
import { FilterClause } from "../../models/filter-clause/filter-clause";
import { DimensionMock } from '../../../common/models/mocks';

var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

import { getMiddleNumber, formatterFromData, formatFilterClause } from './formatter';

describe('General', () => {
  describe('getMiddleNumber', () => {
    it('works in simple case', () => {
      var values = [100, 10, 1, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });

    it('works in more complex case', () => {
      var values = [0, 0, -1000, -100, 10, 1, 0, 0, 0, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });
  });

  describe('formatterFromData', () => {
    it('works in simple case', () => {
      var values = [100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0 a');
      expect(formatter(10)).to.equal('10');
    });

    it('works in k case', () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0.000 a');
      expect(formatter(10)).to.equal('0.010 k');
      expect(formatter(12345)).to.equal('12.345 k');
    });

    it('works in KB case', () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0.000 b');
      expect(formatter(10)).to.equal('0.010 KB');
      expect(formatter(12345)).to.equal('12.056 KB');
    });
  });

  describe('formatFilterClause', () => {
    var timeFilterDifferentMonth = FilterClause.fromJS(
      {
        expression: { op: 'ref', name: 'time' },
        selection: {
          op: 'literal',
          type: 'TIME_RANGE',
          value: { start: new Date('2016-11-11'), end: new Date('2016-12-12') }
        }
      }
    );

    var timeFilterDifferentYear = FilterClause.fromJS(
      {
        expression: { op: 'ref', name: 'time' },
        selection: {
          op: 'literal',
          type: 'TIME_RANGE',
          value: { start: new Date('2015-11-11'), end: new Date('2016-12-12') }
        }
      }
    );

    var timeFilterSameMonth = FilterClause.fromJS(
      {
        expression: { op: 'ref', name: 'time' },
        selection: {
          op: 'literal',
          type: 'TIME_RANGE',
          value: { start: new Date('2015-11-11'), end: new Date('2015-11-14') }
        }
      }
    );


    var numberFilter = FilterClause.fromJS({
      expression: { op: 'ref', name: 'commentLength' },
      selection: {
        op: 'literal',
        value: {
          "setType": "NUMBER",
          "elements": [1, 2, 3]
        },
        "type": "SET"
      },
      exclude: true
    });

    var stringFilterShort = FilterClause.fromJS({
      expression: { op: 'ref', name: 'country' },
      selection: {
        op: 'literal',
        value: {
          "setType": "STRING",
          "elements": ["iceland"]
        },
        "type": "SET"
      }
    });

    it('works in time case', () => {
      expect(formatFilterClause(DimensionMock.time(), timeFilterDifferentMonth, Timezone.UTC)).to.equal('Nov 11 - Dec 11, 2016');
      expect(formatFilterClause(DimensionMock.time(), timeFilterDifferentYear, Timezone.UTC)).to.equal('Nov 11, 2015 - Dec 11, 2016');
      expect(formatFilterClause(DimensionMock.time(), timeFilterSameMonth, Timezone.UTC)).to.equal('Nov 11 - Nov 13, 2015');
    });

    it('works in time case verbose', () => {
      expect(formatFilterClause(DimensionMock.time(), timeFilterDifferentMonth, Timezone.UTC, true)).to.equal('time: Nov 11 - Dec 11, 2016');
    });

    it('works in number case', () => {
      expect(formatFilterClause(DimensionMock.number(), numberFilter, Timezone.UTC)).to.equal('Numeric (3)');
    });

    it('works in number verbose', () => {
      expect(formatFilterClause(DimensionMock.number(), numberFilter, Timezone.UTC, true)).to.equal('Numeric: 1, 2, 3');
    });

    it('works in string case', () => {
      expect(formatFilterClause(DimensionMock.countryString(), stringFilterShort, Timezone.UTC)).to.equal('important countries: iceland');
    });

    it('works in string verbose', () => {
      expect(formatFilterClause(DimensionMock.countryString(), stringFilterShort, Timezone.UTC, true)).to.equal('important countries: iceland');
    });
  });
});
