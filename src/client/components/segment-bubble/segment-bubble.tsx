require('./segment-bubble.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone } from 'chronoshift';
import { $, PlywoodValue, Datum, TimeRange } from 'plywood';
import { Fn } from "../../../common/utils/general/general";
import { Stage, Clicker, Measure } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { clamp } from "../../utils/dom/dom";
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Button } from '../button/button';

const SHPITZ_SIZE = 7;
const PER_LETTER_PIXELS = 5;

export interface SegmentBubbleProps extends React.Props<any> {
  left: number;
  top: number;
  timezone?: Timezone;
  datum?: Datum;
  hideText?: boolean;
  measure?: Measure;
  getValue?: (d: Datum) => PlywoodValue;
  getY?: (d: Datum) => number;
  clicker?: Clicker;
  onClose?: Fn;
}

export interface SegmentBubbleState {
  moreMenuOpenOn?: Element;
}

export class SegmentBubble extends React.Component<SegmentBubbleProps, SegmentBubbleState> {

  constructor() {
    super();
    this.state = {
      moreMenuOpenOn: null
    };

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

  onMore(e: MouseEvent) {
    this.setState({
      moreMenuOpenOn: e.target as any
    });
  }

  closeMoreMenu() {
    this.setState({
      moreMenuOpenOn: null
    });
  }

  getLabel(): string {
    const { timezone, datum, getValue } = this.props;
    if (!datum) return null;
    var value = getValue(datum);
    if (value instanceof TimeRange) {
      return formatTimeRange(value, timezone, DisplayYear.NEVER);
    } else {
      return String(value);
    }
  }

  renderMoreMenu() {
    const { moreMenuOpenOn } = this.state;
    if (!moreMenuOpenOn) return null;

    var menuSize = Stage.fromSize(160, 160);
    var label = this.getLabel();

    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={menuSize}
      openOn={moreMenuOpenOn}
      align="start"
      onClose={this.closeMoreMenu.bind(this)}
    >
      <ul className="bubble-list">
        <li
          className="clipboard"
          data-clipboard-text={label}
          onClick={this.closeMoreMenu.bind(this)}
        >{STRINGS.copyValue}</li>
      </ul>
    </BubbleMenu>;
  }

  render() {
    const { hideText, datum, measure, getY, left, top, clicker } = this.props;

    var textElement: JSX.Element;
    if (!hideText && datum) {
      var label = this.getLabel();

      var minTextWidth = clamp(label.length * PER_LETTER_PIXELS, 60, 200);
      textElement = <div className="text" style={{ minWidth: minTextWidth }}>
        <div className="segment">{label}</div>
        <div className="measure-value">{measure.formatFn(getY(datum))}</div>
      </div>;
    }

    var buttons: JSX.Element;
    if (clicker) {
      buttons = <div className="buttons">
        <Button
          type="primary"
          className="mini"
          onClick={this.onSelect.bind(this)}
          title={STRINGS.select}
        />
        <Button
          type="secondary"
          className="mini"
          onClick={this.onCancel.bind(this)}
          title={STRINGS.cancel}
        />
        <Button
          type="secondary"
          className="mini"
          onClick={this.onMore.bind(this)}
          svg={require('../../icons/full-more-mini.svg')}
        />
      </div>;
    }

    return <BodyPortal left={left} top={top - SHPITZ_SIZE} disablePointerEvents={!clicker}>
      <div className="segment-bubble" ref="bubble">
        {textElement}
        {buttons}
        <div className="shpitz"></div>
        {this.renderMoreMenu()}
      </div>
    </BodyPortal>;
  }
}
