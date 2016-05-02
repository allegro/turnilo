import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';
import * as TestUtils from 'react-addons-test-utils';

import { DataSourceMock } from '../../../common/models/mocks';
import { BodyPortalMock } from '../body-portal/body-portal.mock';

import { $, Expression } from 'plywood';
import { AutoRefreshMenu } from './auto-refresh-menu';

describe('AutoRefreshMenu', () => {
  BodyPortalMock.disableBodyPortal();

  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <AutoRefreshMenu
        onClose={null}
        openOn={openOn}
        autoRefreshRate={null}
        setAutoRefreshRate={null}
        refreshMaxTime={null}
        dataSource={DataSourceMock.wiki()}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('auto-refresh-menu');
  });

});
