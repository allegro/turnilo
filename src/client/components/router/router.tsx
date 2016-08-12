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
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';
import { replaceHash } from '../../utils/url/url';
import { extend } from '../../../common/utils/object/object';
import { SvgIcon } from '../svg-icon/svg-icon';

export type Inflater = (key: string, value: string) => {key: string, value: any};

export interface RouteProps extends React.Props<any> {
  fragment: string;
  alwaysShowOrphans?: boolean;
  transmit?: string[];
  inflate?: Inflater;
}
export interface RouteState {}
export class Route extends React.Component<RouteProps, RouteState> {}


export interface QualifiedPath {
  route: JSX.Element;
  fragment: string;
  crumbs: string[];
  wasDefaultChoice?: boolean;
  properties?: any;
  orphans?: JSX.Element[];
  parentRoutes: JSX.Element[];
}

export interface RouterProps extends React.Props<any> {
  // this callback is mandatory because the outer parent needs to react (lulz)
  // to a change and update its state so it rerenders. The router can't trigger
  // the rerendering by itself, nor should it.
  onURLChange: (breadCrumbs: string[]) => void;

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

    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }


  componentDidMount() {
    window.addEventListener('hashchange', this.globalHashChangeListener);

    // Timeout to avoid race conditions between renders
    window.setTimeout(() => this.onHashChange(window.location.hash), 1);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.globalHashChangeListener);
  }

  globalHashChangeListener(): void {
    var newHash = window.location.hash;

    // Means we're going somewhere unknown and this specific router shouldn't
    // interfer
    if (this.removeRootFragmentFromHash(newHash) === newHash) return;

    if (this.state.hash !== newHash) this.onHashChange(newHash);
  }

  removeRootFragmentFromHash(hash: string): string {
    const { rootFragment } = this.props;

    if (!rootFragment) return hash;

    return hash.replace(new RegExp('^#' + rootFragment, 'gi'), '');
  }

  componentWillReceiveProps(nextProps: RouterProps) {
    this.globalHashChangeListener();
  }

  parseHash(hash: string): string[] {
    if (!hash) return [];

    var fragments = this.removeRootFragmentFromHash(hash).split(HASH_SEPARATOR);

    return fragments.filter(Boolean);
  }

  sanitizeHash(hash: string): string {
    const { rootFragment } = this.props;
    const fragments = this.parseHash(hash);

    if (fragments.length === 0) return '#' + rootFragment;

    return `#${rootFragment}/${fragments.join('/')}`;
  }

  replaceHash(newHash: string) {
    replaceHash(newHash);
    this.onHashChange(newHash);
  }

  hasExtraFragments(path: QualifiedPath): boolean {
    return path.crumbs.length > path.fragment.split(HASH_SEPARATOR).length;
  }

  stripUnnecessaryFragments(path: QualifiedPath, crumbs: string[]) {
    const { rootFragment } = this.props;
    const fragments = path.fragment.split(HASH_SEPARATOR);

    const parentFragment = crumbs.join('/').replace(path.crumbs.join('/'), '').replace(/\/$/, '');
    const strippedRouteCrumbs = path.crumbs.slice(0, path.fragment.split(HASH_SEPARATOR).length);

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

    // Default path
    if (crumbs.length === 0) {
      let defaultFragment = this.getDefaultFragment(children);

      if (defaultFragment) {
        this.replaceHash(hash + '/' + defaultFragment);
        return;
      }
    }

    var path = this.getQualifiedPath(children, crumbs);

    if (path.wasDefaultChoice) {
      crumbs.pop();
      crumbs.push(path.fragment);
      this.replaceHash('#' + [rootFragment].concat(crumbs).join('/'));
      return;
    }

    // Unnecessary fragments
    if (this.hasExtraFragments(path)) {
      this.stripUnnecessaryFragments(path, crumbs);
      return;
    }

    // Default child for this path
    if (this.canDefaultDeeper(path.fragment, path.crumbs)) {
      crumbs = crumbs.concat(this.getDefaultDeeperCrumbs(path.fragment, path.crumbs));
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

  getQualifiedPath(candidates: JSX.Element[], crumbs: string[], properties = {}, orphans: JSX.Element[] = [], parentRoutes: JSX.Element[] = []): QualifiedPath {
    // In case there's only one route
    if (this.isRoute(candidates as any)) {
      candidates = ([candidates as any]) as JSX.Element[];
    }

    for (let i = 0; i < candidates.length; i++) {
      let candidate = candidates[i];

      if (this.isAComment(candidate)) continue;

      let fragment = candidate.props.fragment;

      if (!fragment) continue;

      properties = extend(this.getPropertiesFromCrumbs(crumbs, fragment), properties);

      if (crumbs[0] === fragment || fragment.charAt(0) === ':') {
        let children = candidate.props.children;
        let parents = parentRoutes.concat([candidate]);

        if (!(Array.isArray(children)) || crumbs.length === 1) {
          return {fragment, route: candidate, crumbs, properties, orphans, parentRoutes: parents};
        } else {
          if (candidate.props.alwaysShowOrphans === true) {
            orphans = orphans.concat(children.filter(this.isSimpleChild, this));
          }

          return this.getQualifiedPath(children, crumbs.slice(1), properties, orphans, parents);
        }
      }
    }

    // If we are here, it means no route has been found and we should
    // return a default one.
    var route = candidates.filter(this.isRoute)[0];
    var fragment = route.props.fragment;
    properties = extend(this.getPropertiesFromCrumbs(crumbs, fragment), properties);
    return {fragment, route, crumbs, wasDefaultChoice: true, properties, orphans, parentRoutes};
  }

  hasSingleChild(route: JSX.Element): boolean {
    if (!route) return false;

    return !(Array.isArray(route.props.children));
  }

  isRoute(candidate: JSX.Element): boolean {
    if (!candidate) return false;
    return candidate.type === Route;
  }

  // Those pesky <!-- react-empty: 14 --> thingies...
  isAComment(candidate: JSX.Element): boolean {
    if (!candidate) return false;
    return candidate.type === undefined;
  }

  isSimpleChild(candidate: JSX.Element): boolean {
    if (!candidate) return false;
    return !this.isAComment(candidate) && !this.isRoute(candidate);
  }

  getSimpleChildren(parent: JSX.Element): JSX.Element[] {
    if (!parent) return null;
    return parent.props.children.filter(this.isSimpleChild, this);
  }

  getPropertiesFromCrumbs(crumbs: string[], fragment: string, props: any = {}): any {
    let fragmentToKey = (f: string) => f.slice(1).replace(/=.*$/, '');

    let myCrumbs = crumbs.concat();
    fragment.split(HASH_SEPARATOR).forEach((bit, i) => {
      if (bit.charAt(0) !== ':') return;
      props[fragmentToKey(bit)] = myCrumbs.shift();
    });

    return props;
  }

  inflate(pump: Inflater, properties: any): any {
    if (!pump) return properties;

    let newProperties: any = {};

    for (let originalKey in properties) {
      let {key, value} = pump(originalKey, properties[originalKey]);
      newProperties[key] = value;
    }

    return newProperties;
  }

  fillProperties(child: JSX.Element, path: QualifiedPath, i = 0): JSX.Element {
    if (!(child.type instanceof Function)) return child;

    var propsToTransmit = this.getPropertiesFromCrumbs(path.crumbs, path.route.props.fragment);

    path.parentRoutes.forEach(route => {
      if (route.props.transmit) {
        route.props.transmit.forEach((key: string) => propsToTransmit[key] = path.properties[key]);
      }
    });

    propsToTransmit = this.inflate(path.route.props.inflate, propsToTransmit);

    return React.cloneElement(child, extend(propsToTransmit, {key: i}));
  }

  getQualifiedChild(candidates: JSX.Element[], crumbs: string[]): JSX.Element | JSX.Element[] {
    var elements: JSX.Element[];

    var path = this.getQualifiedPath(candidates, crumbs);

    if (this.hasSingleChild(path.route)) {
      elements = path.orphans.map((orphan, i) => this.fillProperties(orphan, path, i))
        .concat([this.fillProperties(path.route.props.children, path, path.orphans.length)])
        ;

    } else {
      var children = this.getSimpleChildren(path.route);

      if (children.length === 0) return null;

      elements = children
        .map((child, i) => this.fillProperties(child, path, i))
        .concat(path.orphans.map((orphan, i) => this.fillProperties(orphan, path, children.length + i)))
        ;
    }

    if (!elements) return null;
    if (elements.length === 1) return elements[0];
    return elements;
  }

  render() {
    const { children } = this.props;
    const { hash } = this.state;

    if (hash === undefined) return null;

    const crumbs = this.parseHash(hash);
    if (!crumbs || !crumbs.length) return null;

    const qualifiedChildren = this.getQualifiedChild(children as JSX.Element[], crumbs) as any;

    // I wish it wouldn't need an enclosing element but...
    // https://github.com/facebook/react/issues/2127
    return <div className="route-wrapper" style={{width: '100%', height: '100%'}}>{qualifiedChildren}</div>;
  }
}
