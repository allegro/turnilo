require('./segment-bubble.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone } from 'chronoshift';
import { $, PlywoodValue, Datum, TimeRange } from 'plywood';
import { Fn, hasOwnProperty } from "../../../common/utils/general/general";
import { Stage, Clicker, Measure, Essence } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { clamp } from "../../utils/dom/dom";
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { BodyPortal } from '../body-portal/body-portal';
import { Shpitz } from '../shpitz/shpitz';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Button } from '../button/button';

const OFFSET_V = -10;
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
  openRawDataModal?: Fn;

  urls?: string[];
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
    const { moreMenuOpenOn } = this.state;
    if (moreMenuOpenOn) return this.closeMoreMenu();
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

  getReplacedUrl(label: string) {
    var { urls, datum } = this.props;
    var idx = 0;
    if (urls.length !== 1) {
      const nestIndex = (datum['__nest'] as number) - 1;
      idx = nestIndex;
    }
    var url = urls[idx];
    return url.replace(/%s/g, label);
  }

  getHasUrl() {
    const { urls, datum } = this.props;
    var index = 0;
    if (hasOwnProperty(datum, '__nest')) index = datum['__nest'] as number - 1;
    return Boolean(urls[index]);
  }

  openRawDataModal(): void {
    const { openRawDataModal } = this.props;
    this.closeMoreMenu();
    openRawDataModal();
  }

  renderMoreMenu() {
    const { moreMenuOpenOn } = this.state;
    if (!moreMenuOpenOn) return null;
    var menuSize = Stage.fromSize(160, 160);
    var label = this.getLabel();

    const bubbleListItems = [
      <li
        key="copyValue"
        className="clipboard"
        data-clipboard-text={label}
        onClick={this.closeMoreMenu.bind(this)}
      >{STRINGS.copyValue}</li>
    ];

    if (this.getHasUrl()) {
      bubbleListItems.push(
        <li
          key="goToUrl"
        > <a href={this.getReplacedUrl(label)} onClick={this.closeMoreMenu.bind(this)} target="_blank" >
          {STRINGS.goToUrl}
          </a>
        </li>
      );
    }

    bubbleListItems.push(
      <li
        className="view-raw-data"
        data-clipboard-text={label}
        onClick={this.openRawDataModal.bind(this)}
      >{STRINGS.viewRawData}</li>
    );

    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={menuSize}
      openOn={moreMenuOpenOn}
      align="start"
      onClose={this.closeMoreMenu.bind(this)}
    >
      <ul className="bubble-list">
        { bubbleListItems }
      </ul>
    </BubbleMenu>;
  }

  render() {
    const { hideText, datum, measure, getY, left, top, clicker } = this.props;
    const { moreMenuOpenOn } = this.state;

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
          active={Boolean(moreMenuOpenOn)}
        />
      </div>;
    }

    return <BodyPortal left={left} top={top + OFFSET_V} disablePointerEvents={!clicker}>
      <div className="segment-bubble" ref="bubble">
        {textElement}
        {buttons}
        <Shpitz direction="up"/>
        {this.renderMoreMenu()}
      </div>
    </BodyPortal>;
  }
}
