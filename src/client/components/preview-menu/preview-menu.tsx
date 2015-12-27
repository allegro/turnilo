'use strict';
require('./preview-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, TimePreset, SplitCombine } from '../../../common/models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
//import { MenuHeader } from '../menu-header/menu-header';
//import { MenuTable } from '../menu-table/menu-table';
//import { MenuTimeSeries } from '../menu-time-series/menu-time-series';

const ACTION_SIZE = 60;

export interface PreviewMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  triggerFilterMenu: Function;
  triggerSplitMenu: Function;
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
    var { dimension, triggerFilterMenu, onClose } = this.props;
    triggerFilterMenu(dimension);
    onClose();
  }

  onSplit(): void {
    var { clicker, essence, dimension, triggerSplitMenu, onClose } = this.props;
    if (essence.splits.hasSplitOn(dimension) && essence.splits.length() === 1) {
      triggerSplitMenu(dimension);
    } else {
      clicker.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.UnfairGame);
    }
    onClose();
  }

  onSubsplit(): void {
    var { clicker, essence, dimension, triggerSplitMenu, onClose } = this.props;
    if (essence.splits.hasSplitOn(dimension)) {
      triggerSplitMenu(dimension);
    } else {
      clicker.addSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.UnfairGame);
    }
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
    return <BubbleMenu
      className="preview-menu"
      direction={direction}
      containerStage={containerStage}
      stage={menuSize}
      fixedSize={true}
      openOn={openOn}
      onClose={onClose}
    >
      <div className="filter action" onClick={this.onFilter.bind(this)}>
        <SvgIcon svg={require('../../icons/preview-filter.svg')}/>
        <div className="action-label">Filter</div>
      </div>
      <div className="pin action" onClick={this.onPin.bind(this)}>
        <SvgIcon svg={require('../../icons/preview-pin.svg')}/>
        <div className="action-label">Pin</div>
      </div>
      <div className="split action" onClick={this.onSplit.bind(this)}>
        <SvgIcon svg={require('../../icons/preview-split.svg')}/>
        <div className="action-label">Split</div>
      </div>
      <div className="subsplit action" onClick={this.onSubsplit.bind(this)}>
        <SvgIcon svg={require('../../icons/preview-subsplit.svg')}/>
        <div className="action-label">Subsplit</div>
      </div>
    </BubbleMenu>;
  }
}
