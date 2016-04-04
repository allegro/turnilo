require('./segment-bubble.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { $, PlywoodValue, Datum, TimeRange } from 'plywood';
import { Fn } from "../../../common/utils/general/general";
import { Clicker, Measure } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';

export interface SegmentBubbleProps extends React.Props<any> {
  left: number;
  top: number;
  timezone?: Timezone;
  datum?: Datum;
  measure?: Measure;
  getValue?: (d: Datum) => PlywoodValue;
  getY?: (d: Datum) => number;
  clicker?: Clicker;
  onClose?: Fn;
}

export interface SegmentBubbleState {
}

export class SegmentBubble extends React.Component<SegmentBubbleProps, SegmentBubbleState> {

  constructor() {
    super();
    // this.state = {};

  }

  onSelect(e: MouseEvent) {
    var { onClose, clicker } = this.props;
    clicker.acceptHighlight();
    if (onClose) onClose();
  }

  onCancel(e: MouseEvent) {
    var { onClose, clicker } = this.props;
    clicker.dropHighlight();
    if (onClose) onClose();
  }

  render() {
    const { timezone, datum, measure, getValue, getY, left, top, clicker } = this.props;

    var textElement: JSX.Element;
    if (datum) {
      var value = getValue(datum);
      var label: string;
      if (value instanceof TimeRange) {
        label = formatTimeRange(value, timezone, DisplayYear.NEVER);
      } else {
        label = String(value);
      }

      textElement = <div className="text">
        <span className="segment">{label}</span>
        <span className="measure-value">{measure.formatFn(getY(datum))}</span>
      </div>;
    }

    var buttons: JSX.Element;
    if (clicker) {
      buttons = <div className="buttons">
        <button className="select" onClick={this.onSelect.bind(this)}>{STRINGS.select}</button>
        <button className="cancel" onClick={this.onCancel.bind(this)}>{STRINGS.cancel}</button>
      </div>;
    }

    return <BodyPortal left={left} top={top} disablePointerEvents={!clicker}>
      <div className="segment-bubble">
        <div className="segment-bubble-inner">
          {textElement}
          {buttons}
          <div className="shpitz"></div>
        </div>
      </div>
    </BodyPortal>;
  }
}
