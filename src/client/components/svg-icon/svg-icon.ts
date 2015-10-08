'use strict';
require('./svg-icon.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';

export interface SvgIconProps {
  svg: string;
  className?: string;
  style?: any;
}

export interface SvgIconState {
  viewBox: string;
  svgInsides: string;
}

export class SvgIcon extends React.Component<SvgIconProps, SvgIconState> {

  constructor() {
    super();
    this.state = {
      viewBox: null,
      svgInsides: null
    };
  }

  componentWillMount() {
    var { svg } = this.props;

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

    this.setState({
      viewBox,
      svgInsides
    });
  }

  render() {
    var { className, style } = this.props;
    var { viewBox, svgInsides } = this.state;

    return React.createElement('svg', {
      className: "svg-icon " + (className || ''),
      viewBox: viewBox,
      preserveAspectRatio: "xMidYMid meet",
      style,
      dangerouslySetInnerHTML: {
        __html: svgInsides
      }
    });
  }
}
