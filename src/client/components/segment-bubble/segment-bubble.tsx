require('./segment-bubble.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Dimension } from '../../../common/models/index';
import { clamp } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';
import { Shpitz } from '../shpitz/shpitz';
import { SegmentActionButtons } from '../segment-action-buttons/segment-action-buttons';

const OFFSET_V = -10;
const PER_LETTER_PIXELS = 8;

export interface SegmentBubbleProps extends React.Props<any> {
  left: number;
  top: number;
  dimension?: Dimension;
  segmentLabel?: string;
  measureLabel?: string;
  hideText?: boolean;
  clicker?: Clicker;
  onClose?: Fn;
  openRawDataModal?: Fn;
}

export interface SegmentBubbleState {
  moreMenuOpenOn?: Element;
}

export class SegmentBubble extends React.Component<SegmentBubbleProps, SegmentBubbleState> {

  constructor() {
    super();
    //this.state = {};

  }

  render() {
    const { left, top, hideText, dimension, segmentLabel, measureLabel, clicker, openRawDataModal, onClose } = this.props;

    var textElement: JSX.Element;
    if (!hideText && segmentLabel) {
      var minTextWidth = clamp(segmentLabel.length * PER_LETTER_PIXELS, 80, 300);
      textElement = <div className="text" style={{ minWidth: minTextWidth }}>
        <div className="segment">{segmentLabel}</div>
        {measureLabel ? <div className="measure-value">{measureLabel}</div> : null}
      </div>;
    }

    return <BodyPortal left={left} top={top + OFFSET_V} disablePointerEvents={!clicker}>
      <div className="segment-bubble" ref="bubble">
        {textElement}
        {clicker ? <SegmentActionButtons clicker={clicker} dimension={dimension} segmentLabel={segmentLabel} openRawDataModal={openRawDataModal} onClose={onClose}/> : null}
        <Shpitz direction="up"/>
      </div>
    </BodyPortal>;
  }
}
