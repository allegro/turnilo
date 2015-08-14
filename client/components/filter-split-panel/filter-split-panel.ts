'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone } from "chronology";
import { $, Expression, Dispatcher, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { DataSource, Filter, SplitCombine, Dimension, Measure, Clicker } from "../../models/index";
import { FilterSplitMenu } from "../filter-split-menu/filter-split-menu";
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';

interface FilterSplitPanelProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  timezone: Timezone;
  selectedDimension: Dimension;
}

interface FilterSplitPanelState {
  selectedDimension?: Dimension;
  anchor?: number;
  rect?: ClientRect;
  trigger?: Element;
}

export class FilterSplitPanel extends React.Component<FilterSplitPanelProps, FilterSplitPanelState> {
  constructor() {
    super();
    this.state = {
      selectedDimension: null,
      anchor: null,
      rect: null
    };
    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalResizeListener() {
    this.setState({
      rect: React.findDOMNode(this).getBoundingClientRect()
    });
  }

  componentWillReceiveProps(nextProps: FilterSplitPanelProps) {

  }

  menuOpen(target: Element, dimension: Dimension) {
    var currentTrigger = this.state.trigger;
    if (currentTrigger === target) {
      this.menuClose();
      return;
    }
    var targetRect = target.getBoundingClientRect();
    var containerRect = this.state.rect;
    this.setState({
      selectedDimension: dimension,
      anchor: targetRect.top - containerRect.top + Math.floor(targetRect.height / 2),
      trigger: target
    });
  }

  menuClose() {
    this.setState({
      selectedDimension: null,
      anchor: null,
      trigger: null
    });
  }

  render() {
    var { dataSource, filter, splits, clicker, timezone } = this.props;
    var { selectedDimension, anchor, rect, trigger } = this.state;

    var menu: React.ReactElement<any> = null;
    if (selectedDimension) {
      menu = JSX(`<FilterSplitMenu
        clicker={clicker}
        dataSource={dataSource}
        filter={filter}
        dimension={selectedDimension}
        anchor={anchor}
        height={rect.height}
        trigger={trigger}
        onClose={this.menuClose.bind(this)}
      />`);
    }

    var triggerMenuOpen = this.menuOpen.bind(this);

    return JSX(`
      <div className="filter-split-panel">
        <FilterTile
          clicker={clicker}
          dataSource={dataSource}
          filter={filter}
          timezone={timezone}
          selectedDimension={selectedDimension}
          triggerMenuOpen={triggerMenuOpen}
        />
        <SplitTile
          clicker={clicker}
          dataSource={dataSource}
          splits={splits}
          selectedDimension={selectedDimension}
          triggerMenuOpen={triggerMenuOpen}
        />
        <DimensionListTile
          clicker={clicker}
          dataSource={dataSource}
          selectedDimension={selectedDimension}
          triggerMenuOpen={triggerMenuOpen}
        />
        {menu}
      </div>
    `);
  }
}
