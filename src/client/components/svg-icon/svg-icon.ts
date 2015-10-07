'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
// import { SomeComp } from '../some-comp/some-comp';

// I am: import { SvgIcon } from '../svg-icon/svg-icon';

export interface SvgIconProps {
  className?: string;
  name?: string;
  style?: any;
  color?: string;
  width?: any;
  height?: any;
}

export interface SvgIconState {
}

export class SvgIcon extends React.Component<SvgIconProps, SvgIconState> {

  constructor() {
    super();
    // this.state = {};
  }

  render() {
    var { name, className } = this.props;

    var svg = require('../../../../resources/icons/' + name + '.svg');
    svg = svg.replace(/<\?xml [^>]+>\s*/i, '');
    svg = svg.replace(/<svg [^>]+>\s*/i, '');
    svg = svg.replace(/<\/svg>/i, '');
    console.log('svg', svg);

    return React.createElement('svg', {
      className: "svg-icon " + className,
      dangerouslySetInnerHTML: {
        __html: svg
      }
    });
  }
}
