import { findDOMNode } from '../../utils/test-utils/index';

import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataSourceMock, EssenceMock } from '../../../common/models/mocks';


import { Router, Route } from './router';

// Fake class to show the usage of variables in URLs
interface FakeProps extends React.Props<any> {
  itemId?: string;
  action?: string;
}

interface FakeState {}

class Fake extends React.Component<FakeProps, FakeState> {
  constructor() {
    super();
  }

  render() {
    let str = `${this.props.action || ''}${this.props.itemId || ''}`;

    return <div className="fakey-fakey">{str}</div>;
  }
}
// -- end of Fake class

describe('Router', () => {
  var children: JSX.Element[];
  var component: React.Component<any, any>;
  var node: any;

  var updateHash: (newHash: string) => void;
  var isActiveRoute: (route: string) => void;

  beforeEach(() => {
    updateHash = (newHash: string) => {

      window.location.hash = newHash;

      component = ReactDOM.render(<Router rootFragment="root" hash={newHash}>
        {children}
      </Router>, node);
    };

    isActiveRoute = (route: string) => {
      expect(window.location.hash, 'window.location.hash should be').to.equal(route);
    };
  });

  describe('with initial location', () => {
    beforeEach(() => {
      node = window.document.createElement('div');

      children = [
        <Route fragment="foo">
          <div className="foo-class">foo</div>
          <Route fragment="foo-0">
            <div className="foo-0-class">foo-0</div>
          </Route>
          <Route fragment="foo-1">
            <div className="foo-1-class">foo-1</div>
          </Route>
        </Route>,

        <Route fragment="bar">
          <div className="bar-class">bar</div>
        </Route>,

        <Route fragment="baz">
          <div className="baz-class">baz</div>
          <Route fragment=":itemId"><Fake/></Route> // Fake is gonna get passed whatever replaces :bazId in the hash
        </Route>,

        <Route fragment="qux">
          <div className="qux-class">qux</div>
          <Route fragment=":itemId/:action=edit"><Fake/></Route> // default value for variable
        </Route>
      ];

      updateHash('root/bar');
    });


    it('initializes to the location', () => {
      expect((findDOMNode(component) as any).className, 'should contain class').to.equal('bar-class');
      isActiveRoute('#root/bar');
    });

    it('fixes multiple slashes', () => {
      updateHash('#root//foo/foo-1///');
      isActiveRoute('#root/foo/foo-1');

      var domNode: any = findDOMNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('foo-1-class');
      expect(domNode.innerHTML).to.equal('foo-1');
    });

    it('fixes wrong fragment and defaults to first route', () => {
      updateHash('#root/ABLAB');
      isActiveRoute('#root/foo');

      var domNode: any = findDOMNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('foo-class');
      expect(domNode.innerHTML).to.equal('foo');
    });

    it('strips extra fragments', () => {
      updateHash('#root/bar/UNNECESSARY');
      isActiveRoute('#root/bar');

      updateHash('#root/baz/pouet/UNNECESSARY');
      var domNode: any = findDOMNode(component) as any;
      isActiveRoute('#root/baz/pouet');
      expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
      expect(domNode.innerHTML).to.equal('pouet');
    });

    it('follows the window.location.hash\'s changes', () => {
      updateHash('#root/baz');

      expect((findDOMNode(component) as any).className, 'should contain class').to.equal('baz-class');
      isActiveRoute('#root/baz');
    });

    it('works with variables in the hash', () => {
      updateHash('#root/baz/pouet');

      var domNode: any = findDOMNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
      expect(domNode.innerHTML).to.equal('pouet');
      isActiveRoute('#root/baz/pouet');
    });

    it('recognizes default for a variable', () => {
      updateHash('#root/qux/myItem');

      var domNode: any = findDOMNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
      expect(domNode.innerHTML).to.equal('editmyItem');
      isActiveRoute('#root/qux/myItem/edit');
    });
  });

  describe('without initial location', () => {

    beforeEach(() => {
      node = window.document.createElement('div');

      children = [
        <Route fragment="foo">
          <div className="foo-class">foo</div>
        </Route>,

        <Route fragment="bar">
          <div className="bar-class">bar</div>
        </Route>,

        <Route fragment="baz">
          <div className="baz-class">baz</div>
        </Route>
      ];

      updateHash('root');
    });


    it('defaults to the first route', () => {
      isActiveRoute('#root/foo');
    });


    it('follows the window.location.hash\'s changes', () => {
      updateHash('#root/baz');

      expect((findDOMNode(component) as any).className, 'should contain class').to.equal('baz-class');
      isActiveRoute('#root/baz');
    });
  });
});
