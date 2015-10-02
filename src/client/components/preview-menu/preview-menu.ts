'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, TimePreset, SplitCombine } from '../../../common/models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
//import { MenuHeader } from '../menu-header/menu-header';
//import { MenuTable } from '../menu-table/menu-table';
//import { MenuTimeSeries } from '../menu-time-series/menu-time-series';

const ACTION_SIZE = 60;

export interface PreviewMenuProps {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  onFilter: Function;
  onClose: Function;
}

export interface PreviewMenuState {
}

export class PreviewMenu extends React.Component<PreviewMenuProps, PreviewMenuState> {

  constructor() {
    super();
    //this.state = {
    //};
  }

  onFilter(): void {
    var { dimension, onFilter, onClose } = this.props;
    onFilter(dimension);
    onClose();
  }

  onSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.KeepIfReady);
    onClose();
  }

  onSubsplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.addSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.KeepIfReady);
    onClose();
  }

  onPin(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.pin(dimension);
    onClose();
  }

  render() {
    var { direction, containerStage, openOn, dimension, onClose } = this.props;
    if (!dimension) return null;

    var menuSize: Stage = Stage.fromSize(ACTION_SIZE * 2, ACTION_SIZE * 2);
    return JSX(`
      <BubbleMenu className="preview-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        <div className="filter action" onClick={this.onFilter.bind(this)}>
          <Icon name="preview-filter"/>
          <div className="action-label">Filter</div>
        </div>
        <div className="split action" onClick={this.onSplit.bind(this)}>
          <Icon name="preview-split"/>
          <div className="action-label">Split</div>
        </div>
        <div className="subsplit action" onClick={this.onSubsplit.bind(this)}>
          <Icon name="preview-subsplit"/>
          <div className="action-label">Subsplit</div>
        </div>
        <div className="pin action"  onClick={this.onPin.bind(this)}>
          <Icon name="preview-pin"/>
          <div className="action-label">Pin</div>
        </div>
      </BubbleMenu>
    `);
  }
}
