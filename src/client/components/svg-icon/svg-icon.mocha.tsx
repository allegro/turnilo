import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { SvgIcon } from './svg-icon';

describe('SvgIcon', () => {
  it('adds the correct class', () => {
    expect(ReactDOM.renderToStaticMarkup(
      <SvgIcon svg={null}/>
    )).to.equal(`<svg class="svg-icon " viewBox="0 0 16 16" preserveAspectRatio="xMidYMid meet"><rect width=16 height=16 fill='red'></rect></svg>`);

    var svg = `<svg width="10px" height="8px" viewBox="0 0 10 8" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M5.00000013,3.79318225 L1.92954627,0.341495392 L0.247423305,1.81335299 L5,7.24486921 Z"></path>
    </g>
</svg>`;

    expect(ReactDOM.renderToStaticMarkup(
      <SvgIcon svg={svg}/>
    )).to.equal(`<svg class="svg-icon " viewBox="0 0 10 8" preserveAspectRatio="xMidYMid meet"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M5.00000013,3.79318225 L1.92954627,0.341495392 L0.247423305,1.81335299 L5,7.24486921 Z"></path>
    </g>
</svg>`);


    //expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    //expect(((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('svg-icon');
  });

});
