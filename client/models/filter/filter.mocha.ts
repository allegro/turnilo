'use strict';

import { expect } from 'chai';

import { Filter } from "./filter";
import { $, Expression } from 'plywood';

describe('Filter', () => {
  it('works in empty case', () => {
    var filter = new Filter();

    expect(filter.toExpression().toString()).to.equal('()');
  });

  it('add work', () => {
    var filter = new Filter();

    filter = filter.add($('language'), 'en');

    expect(filter.toExpression().toString()).to.equal('($language in SET_STRING(1))');
  });
});
