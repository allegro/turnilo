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

import { findDOMNode } from '../../utils/test-utils/index';

import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataCubeMock, EssenceMock } from '../../../common/models/mocks';


import { Router, Route } from './router';

// Fake class to show the usage of variables in URLs
interface FakeProps extends React.Props<any> {
  itemId?: string;
  action?: string;

  object?: {label: string};
}

interface FakeState {}

class Fake extends React.Component<FakeProps, FakeState> {
  constructor() {
    super();
  }

  render() {
    const { itemId, action, object} = this.props;

    let str = `${action || ''}${itemId || ''}${object && object.label || ''}`;

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

  var findNodes = (element: __React.Component<any, any>): NodeList => {
    let wrapper = findDOMNode(element);

    if (wrapper.className !== 'route-wrapper') {
      throw new Error('Wrapper should have the proper class name, found ' + wrapper.className + ' instead');
    }

    return wrapper.childNodes;
  };

  var findNode = (element: __React.Component<any, any>): Node => {
    var children = findNodes(element);

    if (children.length !== 1) {
      throw new Error('Looking for exactly one node, found ' + children.length + ' instead.');
    }

    return children[0];
  };

  beforeEach(() => {
    updateHash = (newHash: string) => {

      window.location.hash = newHash;
      let spy = sinon.spy();

      // Cloning components so that react doesn't complain about the lack of keys...
      component = ReactDOM.render(<Router rootFragment="root" onURLChange={spy}>
        {children.map((c, i) => React.cloneElement(c, {key: i})) }
      </Router>, node);
    };

    isActiveRoute = (route: string) => {
      expect(window.location.hash, 'window.location.hash should be').to.equal(route);
    };
  });

  describe('with variables only', () => {
    beforeEach(() => {
      node = window.document.createElement('div');

      children = [
        <Route fragment=":itemId" alwaysShowOrphans={true}>
          <div className="pouet-class">baz</div> // Should alway be visible
          <Route transmit={['itemId']} fragment=":action"><Fake/></Route>
        </Route>
      ];

      updateHash('root/bar');
    });

    it('works with variables in the hash', () => {
      updateHash('#root/flu/bli');

      var domNodes: NodeList = findNodes(component) as any;

      var getChild = (i: number) => domNodes[i] as Element;

      // Orphan that's always visible
      expect(getChild(0).className, 'should contain class').to.equal('pouet-class');

      // Fakey thing
      expect(getChild(1).className, 'should contain class').to.equal('fakey-fakey');
      expect(getChild(1).innerHTML).to.equal('bliflu');

      isActiveRoute('#root/flu/bli');
    });
  });

  describe('with inflatable variables', () => {
    beforeEach(() => {
      node = window.document.createElement('div');

      var pump = (key: string, value: string): {key: string, value: any} => {
        if (key === 'action') return {key: 'action', value};
        return {key: 'object', value: {label: value.toUpperCase()}};
      };

      children = [
        <Route fragment=":itemId" alwaysShowOrphans={true}>
          <div className="pouet-class">baz</div> // Should alway be visible
          <Route transmit={['itemId']} fragment=":action" inflate={pump}><Fake/></Route>
        </Route>
      ];

      updateHash('root/bar');
    });

    it('inflates stuff on the fly', () => {
      updateHash('#root/flu/bli');

      var domNodes: NodeList = findNodes(component) as any;

      var getChild = (i: number) => domNodes[i] as Element;

      // Orphan that's always visible
      expect(getChild(0).className, 'should contain class').to.equal('pouet-class');

      // Fakey thing
      expect(getChild(1).className, 'should contain class').to.equal('fakey-fakey');
      expect(getChild(1).innerHTML).to.equal('bliFLU');

      isActiveRoute('#root/flu/bli');
    });
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


    it('initializes to the location', (done) => {
      // Timeout because the router waits for a bit before initializing
      setTimeout(() => {
        expect((findNode(component) as any).className, 'should contain class').to.equal('bar-class');
        isActiveRoute('#root/bar');
        done();
      }, 2);
    });

    it('fixes multiple slashes', () => {
      updateHash('#root//foo/foo-1///');
      isActiveRoute('#root/foo/foo-1');

      var domNode: any = findNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('foo-1-class');
      expect(domNode.innerHTML).to.equal('foo-1');
    });

    it('fixes wrong fragment and defaults to first route', () => {
      updateHash('#root/ABLAB');
      isActiveRoute('#root/foo');

      var domNode: any = findNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('foo-class');
      expect(domNode.innerHTML).to.equal('foo');
    });

    it('strips extra fragments', () => {
      updateHash('#root/bar/UNNECESSARY');
      isActiveRoute('#root/bar');

      updateHash('#root/baz/pouet/UNNECESSARY');
      var domNode: any = findNode(component) as any;
      isActiveRoute('#root/baz/pouet');
      expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
      expect(domNode.innerHTML).to.equal('pouet');
    });

    it('follows the window.location.hash\'s changes', () => {
      updateHash('#root/baz');

      expect((findNode(component) as any).className, 'should contain class').to.equal('baz-class');
      isActiveRoute('#root/baz');
    });

    it('works with variables in the hash', () => {
      updateHash('#root/baz/pouet');

      var domNode: any = findNode(component) as any;
      expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
      expect(domNode.innerHTML).to.equal('pouet');
      isActiveRoute('#root/baz/pouet');
    });

    it('recognizes default for a variable', () => {
      updateHash('#root/qux/myItem');

      var domNode: any = findNode(component) as any;
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


    it('defaults to the first route', (done) => {
      // Timeout because the router waits for a bit before initializing
      setTimeout(() => {
        isActiveRoute('#root/foo');
        done();
      }, 2);
    });


    it('follows the window.location.hash\'s changes', () => {
      updateHash('#root/baz');

      expect((findNode(component) as any).className, 'should contain class').to.equal('baz-class');
      isActiveRoute('#root/baz');
    });
  });
});
