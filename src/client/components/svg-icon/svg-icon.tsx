require('./svg-icon.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';

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
    //this.state = {};
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
      console.warn('missing icon');
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
