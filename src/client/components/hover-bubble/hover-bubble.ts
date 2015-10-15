'use strict';
require('./hover-bubble.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { SEGMENT } from '../../config/constants';
import { formatTimeRange } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';
// import { SvgIcon } from '../svg-icon/svg-icon';

export interface HoverBubbleProps {
  essence: Essence;
  datum: Datum;
  measure: Measure;
  getY: Function;
  style: any;
}

export interface HoverBubbleState {
}

export class HoverBubble extends React.Component<HoverBubbleProps, HoverBubbleState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { essence, datum, measure, getY, style } = this.props;

    return JSX(`
      <BodyPortal>
        <div className="hover-bubble" style={style}>
          <div className="hover-bubble-inner">
            <div className="text">
              <span className="bucket">{formatTimeRange(datum[SEGMENT], essence.timezone, true)}</span>
              <span className="measure-value">{measure.formatFn(getY(datum))}</span>
            </div>
            <div className="shpitz"></div>
          </div>
        </div>
      </BodyPortal>
    `);
  }
}
