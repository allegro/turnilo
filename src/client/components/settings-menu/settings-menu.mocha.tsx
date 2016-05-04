import { expect } from 'chai';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { Timezone } from 'chronoshift';
import { SettingsMenu } from './settings-menu';
import { findDOMNode } from '../../utils/test-utils/index';


describe('SettingsMenu', () => {

  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <SettingsMenu
        onClose={null}
        openOn={openOn}
        changeTimezone={() => {}}
        timezone={Timezone.UTC}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('settings-menu');
  });

});
