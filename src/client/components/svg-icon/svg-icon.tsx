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

require('./svg-icon.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';

// Inspired by: https://gist.github.com/MoOx/1eb30eac43b2114de73a

export interface SvgIconProps extends React.Props<any> {
  svg: string;
  className?: string;
  style?: any;
}

export interface SvgIconState {
}

export class SvgIcon extends React.Component<SvgIconProps, SvgIconState> {

  constructor() {
    super();
  }

  render() {
    var { className, style, svg } = this.props;

    var viewBox: string = null;
    var svgInsides: string = null;
    if (typeof svg === 'string') {
      svgInsides = svg
        .substr(0, svg.length - 6) // remove trailing "</svg>"
        .replace(/^<svg [^>]+>\s*/i, (svgDec: string) => {
          var vbMatch = svgDec.match(/viewBox="([\d ]+)"/);
          if (vbMatch) viewBox = vbMatch[1];
          return '';
        });
    } else {
      console.warn('svg-icon.tsx: missing icon');
      viewBox = '0 0 16 16';
      svgInsides = "<rect width=16 height=16 fill='red'></rect>";
    }

    return React.createElement('svg', {
      className: "svg-icon " + (className || ''),
      viewBox: viewBox,
      preserveAspectRatio: "xMidYMid meet",
      style,
      dangerouslySetInnerHTML: { __html: svgInsides }
    });
  }
}
