'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface FancyDragIndicatorProps {
  dragInsertPosition: number;
  dragReplacePosition: number;
}

interface FancyDragIndicatorState {
}

export class FancyDragIndicator extends React.Component<FancyDragIndicatorProps, FancyDragIndicatorState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { dragInsertPosition, dragReplacePosition } = this.props;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    let ghostArrowLeft: number;
    if (dragInsertPosition !== null) {
      ghostArrowLeft = dragInsertPosition * sectionWidth - CORE_ITEM_GAP / 2;
    } else {
      ghostArrowLeft = dragReplacePosition * sectionWidth + CORE_ITEM_WIDTH / 2;
    }

    var dragGhostElement: React.DOMElement<any> = null;
    if (dragReplacePosition !== null) {
      let left = dragReplacePosition * sectionWidth;
      dragGhostElement = JSX(`<div className="drag-ghost-element" style={{left: left}}></div>`);
    }

    return JSX(`
      <div className="fancy-drag-indicator">
        {dragGhostElement}
        <Icon className="drag-ghost-arrow" name="drag-arrow" style={{left: ghostArrowLeft}}/>
      </div>
    `);
  }
}
