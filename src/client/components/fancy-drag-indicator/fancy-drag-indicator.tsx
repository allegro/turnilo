require('./fancy-drag-indicator.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { DragPosition } from '../../../common/models/index';

export interface FancyDragIndicatorProps extends React.Props<any> {
  dragPosition: DragPosition;
}

export interface FancyDragIndicatorState {
}

export class FancyDragIndicator extends React.Component<FancyDragIndicatorProps, FancyDragIndicatorState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { dragPosition } = this.props;
    if (!dragPosition) return null;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    let ghostArrowLeft: number;
    let dragGhostElement: JSX.Element = null;
    if (dragPosition.isInsert()) {
      ghostArrowLeft = dragPosition.insert * sectionWidth - CORE_ITEM_GAP / 2;
    } else {
      ghostArrowLeft = dragPosition.replace * sectionWidth + CORE_ITEM_WIDTH / 2;
      let left = dragPosition.replace * sectionWidth;
      dragGhostElement = <div className="drag-ghost-element" style={{left: left}}></div>;
    }

    return <div className="fancy-drag-indicator">
      {dragGhostElement}
      <SvgIcon className="drag-ghost-arrow" svg={require('../../icons/drag-arrow.svg')} style={{left: ghostArrowLeft}}/>
    </div>;
  }
}
