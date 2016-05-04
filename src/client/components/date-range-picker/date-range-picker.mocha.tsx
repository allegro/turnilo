import { expect } from 'chai';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { Timezone } from "chronoshift";

import '../../utils/test-utils/index';

import { DateRangePicker } from './date-range-picker';
var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}


describe('DateRangePicker', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <DateRangePicker
        startTime={new Date(Date.UTC(2003, 11, 2))}
        endTime={new Date(Date.UTC(2004, 11, 2))}
        maxTime={new Date(Date.UTC(2004, 11, 2))}
        timezone={Timezone.UTC}
        onStartChange={() => {}}
        onEndChange={() => {}}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('date-range-picker');
  });

  it('throws on non round start time input', () => {
    expect(() => {
      TestUtils.renderIntoDocument(
        <DateRangePicker
          startTime={new Date(Date.UTC(2003, 11, 2, 2, 4))}
          endTime={new Date(Date.UTC(2004, 11, 2))}
          maxTime={new Date(Date.UTC(2004, 11, 2))}
          timezone={Timezone.UTC}
          onStartChange={() => {}}
          onEndChange={() => {}}
        />);
    }).to.throw('start time must be round');
  });

  it('throws on non round end time input', () => {
    expect(() => {
      TestUtils.renderIntoDocument(
      <DateRangePicker
        startTime={new Date(Date.UTC(2003, 11, 2))}
        endTime={new Date(Date.UTC(2004, 11, 2, 2, 3))}
        maxTime={new Date(Date.UTC(2004, 11, 2))}
        timezone={Timezone.UTC}
        onStartChange={() => {}}
        onEndChange={() => {}}
      />);
    }).to.throw('end time must be round');
  });
});
