'use strict';
require('./svg-icon.css');

import { List } from 'immutable';
import * as React from 'react/addons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';

export interface SvgIconProps {
  className?: string;
  name?: string;
  style?: any;
  color?: string;
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
    var { name } = this.props;

    var viewBox: string = null;
    var svg = require('../../../../assets/icons/' + name + '.svg');
    svg = svg.replace(/^<svg [^>]+>\s*/i, (svgDec: string) => {
      var vbMatch = svgDec.match(/viewBox="([\d ]+)"/);
      if (vbMatch) viewBox = vbMatch[1];
      return '';
    });
    svg = svg.substr(0, svg.length - 6); // remove trailing "</svg>"

    this.setState({
      viewBox,
      svgInsides: svg
    });
  }

  render() {
    var { className } = this.props;
    var { viewBox, svgInsides } = this.state;

    return React.createElement('svg', {
      className: "svg-icon " + className,
      viewBox: viewBox,
      preserveAspectRatio: "xMidYMid meet",
      dangerouslySetInnerHTML: {
        __html: svgInsides
      }
    });
  }
}
