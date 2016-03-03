require('./hover-bubble.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { TIME_SEGMENT } from '../../config/constants';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';

export interface HoverBubbleProps extends React.Props<any> {
  essence: Essence;
  datum: Datum;
  measure: Measure;
  getY: Function;
  left: number;
  top: number;
}

export interface HoverBubbleState {
}

export class HoverBubble extends React.Component<HoverBubbleProps, HoverBubbleState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { essence, datum, measure, getY, left, top } = this.props;

    return <BodyPortal left={left} top={top} disablePointerEvents={true}>
      <div className="hover-bubble">
        <div className="hover-bubble-inner">
          <div className="text">
            <span className="bucket">{formatTimeRange(datum[TIME_SEGMENT] as TimeRange, essence.timezone, DisplayYear.NEVER)}</span>
            <span className="measure-value">{measure.formatFn(getY(datum))}</span>
          </div>
          <div className="shpitz"></div>
        </div>
      </div>
    </BodyPortal>;
  }
}
