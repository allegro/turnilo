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

require('./router.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface RouteProps extends React.Props<any> { fragment: string; }
export interface RouteState {}
export class Route extends React.Component<RouteProps, RouteState> {}


export interface QualifiedPath {
  route: JSX.Element;
  fragment: string;
  crumbs: string[];
  wasDefaultChoice?: boolean;
}

export interface RouterProps extends React.Props<any> {
  hash: string;
  onURLChange?: (breadCrumbs: string[]) => void;
  rootFragment?: string;
}

export interface RouterState {
  hash?: string;
}

const HASH_SEPARATOR = /\/+/;

export class Router extends React.Component<RouterProps, RouterState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.onHashChange(window.location.hash);
  }

  componentWillReceiveProps(nextProps: RouterProps) {
    if (this.props.hash !== nextProps.hash) this.onHashChange(nextProps.hash);
  }

  parseHash(hash: string): string[] {
    if (!hash) return [];

    if (hash.charAt(0) === '#') hash = hash.substr(1);

    var fragments = hash.split(HASH_SEPARATOR);

    if (fragments[0] === this.props.rootFragment) fragments.shift();

    return fragments.filter(Boolean);
  }

  sanitizeHash(hash: string): string {
    const { rootFragment } = this.props;
    const fragments = this.parseHash(hash);

    if (fragments.length === 0) return '#' + rootFragment;

    return `#${rootFragment}/${fragments.join('/')}`;
  }

  replaceHash(newHash: string) {
    // Acts like window.location.hash = newHash but doesn't clutter the history
    // See http://stackoverflow.com/a/23924886/863119
    window.history.replaceState(undefined, undefined, newHash);
    this.onHashChange(newHash);
  }

  hasExtraFragments(route: QualifiedPath): boolean {
    return route.crumbs.length > route.fragment.split(HASH_SEPARATOR).length;
  }

  stripUnnecessaryFragments(route: QualifiedPath, crumbs: string[]) {
    const { rootFragment } = this.props;
    const fragments = route.fragment.split(HASH_SEPARATOR);

    const parentFragment = crumbs.join('/').replace(route.crumbs.join('/'), '').replace(/\/$/, '');
    const strippedRouteCrumbs = route.crumbs.slice(0, route.fragment.split(HASH_SEPARATOR).length);

    const strippedCrumbs = [
      rootFragment,
      parentFragment,
      strippedRouteCrumbs.join('/')
    ].filter(Boolean);

    this.replaceHash('#' + strippedCrumbs.join('/'));
  }

  onHashChange(hash: string) {
    const { rootFragment } = this.props;

    var safeHash = this.sanitizeHash(hash);
    if (hash !== safeHash) {
      this.replaceHash(safeHash);
      return;
    }

    var crumbs = this.parseHash(hash);

    var children = this.props.children as JSX.Element[];

    // Default route
    if (crumbs.length === 0) {
      let defaultFragment = this.getDefaultFragment(children);
      window.location.hash = hash + '/' + defaultFragment;
      return;
    }

    var route = this.getQualifiedRoute(children, crumbs);
    if (route.wasDefaultChoice) {
      crumbs.pop();
      crumbs.push(route.fragment);
      this.replaceHash('#' + [rootFragment].concat(crumbs).join('/'));
      return;
    }

    // Unnecessary fragments
    if (this.hasExtraFragments(route)) {
      this.stripUnnecessaryFragments(route, crumbs);
      return;
    }

    // Default child for this route
    if (this.canDefaultDeeper(route.fragment, route.crumbs)) {
      crumbs = crumbs.concat(this.getDefaultDeeperCrumbs(route.fragment, route.crumbs));
      this.replaceHash('#' + [rootFragment].concat(crumbs).join('/'));
    }

    if (this.props.onURLChange) {
      this.props.onURLChange(crumbs);
    }

    this.setState({hash: window.location.hash});
  }

  getDefaultDeeperCrumbs(fragment: string, crumbs: string[]): string[] {
    var bits = fragment.split(HASH_SEPARATOR);

    bits.splice(0, crumbs.length);

    return bits.map((bit) => bit.match(/^:[^=]+=(\w+)$/)[1]);
  }

  canDefaultDeeper(fragment: string, crumbs: string[]): boolean {
    var bits = fragment.split(HASH_SEPARATOR);

    if (bits.length === crumbs.length) return false;

    bits.splice(0, crumbs.length);

    return bits.every((bit) => /^:[^=]+=\w+$/.test(bit));
  }

  getDefaultFragment(children: JSX.Element[]): string {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];

      if (child.type === Route) {
        return child.props.fragment;
      }
    }

    return undefined;
  }

  getQualifiedRoute(candidates: JSX.Element[], crumbs: string[]): QualifiedPath {
    var isRoute = (element: JSX.Element) => element.type === Route;

    for (let i = 0; i < candidates.length; i++) {
      let candidate = candidates[i];
      let fragment = candidate.props.fragment;

      if (!fragment) continue;

      if (crumbs[0] === fragment || fragment.charAt(0) === ':') {
        if (!(candidate.props.children instanceof Array)) {
          return {fragment, route: candidate, crumbs};
        } else if (crumbs.length === 1) {
          return {fragment, route: candidate, crumbs};
        } else {
          return this.getQualifiedRoute(candidate.props.children, crumbs.slice(1));
        }
      }
    }

    // If we are here, it means no route has been found and we should
    // return a default one.
    var route = candidates.filter(isRoute)[0];
    var fragment = route.props.fragment;
    return {fragment, route, crumbs, wasDefaultChoice: true};
  }

  isRoute(candidate: JSX.Element): boolean {
    if (!candidate) return false;
    return candidate.type === Route;
  }

  isSimpleRoute(route: JSX.Element): boolean {
    if (!route) return false;

    return !(route.props.children instanceof Array);
  }

  getDefaultRoute(route: JSX.Element): JSX.Element {
    if (!route) return null;

    return route.props.children.filter((child: JSX.Element) => !this.isRoute(child))[0];
  }

  getQualifiedChild(candidates: JSX.Element[], crumbs: string[]): JSX.Element {
    var fillProps = (child: JSX.Element, crumbs: string[], fragment: string): JSX.Element => {
      let newProps: any = {};
      fragment.split(HASH_SEPARATOR).forEach((bit, i) => {
        if (bit.charAt(0) !== ':') return;
        newProps[bit.slice(1).replace(/=.*$/, '')] = crumbs.shift();
      });

      return React.cloneElement(child, newProps);
    };

    var result = this.getQualifiedRoute(candidates, crumbs);

    if (this.isSimpleRoute(result.route)) {
      return fillProps(result.route.props.children, result.crumbs, result.fragment);
    }

    if (this.getDefaultRoute(result.route)) {
      return fillProps(this.getDefaultRoute(result.route), result.crumbs, result.fragment);
    }

    return null;
  }

  render() {
    const { children } = this.props;
    const { hash } = this.state;

    if (hash === undefined) return <div/>; // returning null causes the tests to fail...

    const crumbs = this.parseHash(hash);
    if (!crumbs || !crumbs.length) return null;

    return this.getQualifiedChild(children as JSX.Element[], crumbs);
  }
}
