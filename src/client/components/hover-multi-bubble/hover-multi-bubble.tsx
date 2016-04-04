require('./hover-multi-bubble.css');

import * as React from 'react';
import { $, Datum, TimeRange } from 'plywood';
import { Stage, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SEGMENT, TIME_SEGMENT } from '../../config/constants';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';

const LEFT_OFFSET = 22;

export interface HoverMultiBubbleProps extends React.Props<any> {
  essence: Essence;
  datums: Datum[];
  measure: Measure;
  getY: (d: Datum) => number;
  left: number;
  top: number;
}

export interface HoverMultiBubbleState {
}

export class HoverMultiBubble extends React.Component<HoverMultiBubbleProps, HoverMultiBubbleState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { essence, datums, measure, getY, left, top } = this.props;
    const { colors } = essence;

    var existingDatum = datums.filter(Boolean)[0];

    if (!datums || !existingDatum || !colors) return null;

    var colorValues = colors.getColors(datums.map(datum => datum ? datum[SEGMENT] : '!___DUMMY___!'));

    var colorSwabs = datums.map((datum, i) => {
      if (!datum) return null;
      var segmentValue = datum[SEGMENT];
      var segmentValueString = String(segmentValue);
      var segmentMeasure = getY(datum);
      var swabStyle = { background: colorValues[i] };
      return <div className="color" key={segmentValueString}>
        <div className="color-swab" style={swabStyle}></div>
        <div className="color-name">{segmentValueString}</div>
        <div className="color-value">{measure.formatFn(segmentMeasure)}</div>
      </div>;
    });

    return <BodyPortal left={left + LEFT_OFFSET} top={top} disablePointerEvents={true}>
      <div className="hover-multi-bubble">
        <div className="bucket">{formatTimeRange(existingDatum[TIME_SEGMENT] as TimeRange, essence.timezone, DisplayYear.NEVER)}</div>
        <div className="colors">{colorSwabs}</div>
      </div>
    </BodyPortal>;
  }
}
