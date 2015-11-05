'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { DataSource } from './data-source';

describe('DataSource', () => {
  it('is an immutable class', () => {
    testImmutableClass(DataSource, [
      //{
      //  name: "twitter",
      //  title: "Twitter",
      //  engine: "druid",
      //  source: "twitter"
      //}
    ]);
  });

});
