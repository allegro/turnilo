'use strict';
require('./split-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, RefExpression, Executor, Dataset, TimeBucketAction, SortAction, LimitAction } from 'plywood';
import { Stage, Clicker, Essence, VisStrategy, DataSource, SplitCombine, Filter, Colors, Dimension, Measure, SortOn } from '../../../common/models/index';
import { SEGMENT } from '../../config/constants';
import { enterKey } from '../../utils/dom/dom';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown, DropdownProps } from '../dropdown/dropdown';

const GRANULARITIES = ['PT1M', 'PT5M', 'PT1H', 'P1D', 'P7D'];

function formatLimit(limit: number | string): string {
  if (limit === 'custom') return 'Custom';
  return limit === null ? 'None' : String(limit);
}

function formatGranularity(gran: string): string {
  return gran.replace(/^PT?/, '');
}

export interface SplitMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  split: SplitCombine;
  onClose: Function;
}

export interface SplitMenuState {
  split?: SplitCombine;
  colors?: Colors;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      split: null,
      colors: null
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, split } = this.props;
    var { dataSource, colors } = essence;

    var myColors: Colors = null;
    if (colors) {
      var colorDimension = dataSource.getDimension(colors.dimension);
      if (colorDimension.expression.equals(split.expression)) {
        myColors = colors;
      }
    }

    this.setState({
      split,
      colors: myColors
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  onSelectGran(gran: string): void {
    var { split } = this.state;
    var bucketAction = split.bucketAction;
    if (bucketAction instanceof TimeBucketAction) {
      this.setState({
        split: split.changeBucketAction(new TimeBucketAction({
          duration: Duration.fromJS(gran),
          timezone: bucketAction.timezone
        }))
      });
    }
  }

  onSelectSortOn(sortOn: SortOn): void {
    var { split } = this.state;
    var sortAction = split.sortAction;
    var direction = sortAction ? sortAction.direction : SortAction.DESCENDING;
    this.setState({
      split: split.changeSortAction(new SortAction({
        expression: sortOn.getExpression(),
        direction
      }))
    });
  }

  onToggleDirection(): void {
    var { split } = this.state;
    var { sortAction } = split;
    this.setState({
      split: split.changeSortAction(sortAction.toggleDirection())
    });
  }

  onSelectLimit(limit: number): void {
    var { essence } = this.props;
    var { split } = this.state;
    var { colors } = essence;

    if (colors) {
      colors = Colors.fromLimit(colors.dimension, limit);
    }

    this.setState({
      split: split.changeLimit(limit),
      colors
    });
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, essence, onClose } = this.props;
    var { split, colors } = this.state;

    clicker.changeSplits(essence.splits.replace(this.props.split, split), VisStrategy.UnfairGame, colors);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  getSortOn(): SortOn {
    var { essence, dimension } = this.props;
    var { split } = this.state;
    return SortOn.fromSortAction(split.sortAction, essence.dataSource, dimension);
  }

  renderGranularityPicker() {
    var { split } = this.state;
    var selectedGran = (split.bucketAction as TimeBucketAction).duration.toString();

    var buttons = GRANULARITIES.map(g => {
      return <li
        className={'granularity' + (g === selectedGran ? ' selected' : '')}
        key={g}
        onClick={this.onSelectGran.bind(this, g)}
      >{formatGranularity(g)}</li>;
    });

    return <div className="button-group">
      <div className="button-group-title">Granularity</div>
      <ul>{buttons}</ul>
    </div>;
  }

  renderSortDropdown() {
    var { essence, dimension } = this.props;

    var mds = [SortOn.fromDimension(dimension)].concat(essence.dataSource.measures.toArray().map(SortOn.fromMeasure));
    var md = this.getSortOn();

    return React.createElement(Dropdown, {
      label: "Sort by",
      items: mds,
      selectedItem: md,
      equal: SortOn.equal,
      renderItem: SortOn.getTitle,
      keyItem: SortOn.getName,
      onSelect: this.onSelectSortOn.bind(this)
    } as DropdownProps<SortOn>);
  }

  renderSortDirection() {
    var { split } = this.state;
    var direction = split.sortAction.direction;

    return <div className="sort-direction">
      {this.renderSortDropdown()}
      <div className={'direction ' + direction} onClick={this.onToggleDirection.bind(this)}>
        <SvgIcon svg={require('../../icons/sort-arrow.svg')}/>
      </div>
    </div>;
  }

  renderLimitDropdown(includeNone: boolean) {
    var { essence } = this.props;
    var { split, colors } = this.state;
    var { limitAction } = split;

    var items: Array<number | string> = [5, 10, 25, 50, 100];
    var selectedItem: number | string = limitAction ? limitAction.limit : null;
    if (colors) {
      items = [3, 5, 7, 9, 10];
      selectedItem = colors.values ? 'custom' : colors.limit;
    }

    if (includeNone) items.unshift(null);
    return React.createElement(Dropdown, {
      label: "Limit",
      items,
      selectedItem,
      renderItem: formatLimit,
      onSelect: this.onSelectLimit.bind(this)
    } as DropdownProps<number | string>);
  }

  renderTimeControls() {
    return <div>
      {this.renderGranularityPicker()}
      {this.renderSortDirection()}
      {this.renderLimitDropdown(true)}
    </div>;
  }

  renderStringControls() {
    return <div>
      {this.renderSortDirection()}
      {this.renderLimitDropdown(false)}
    </div>;
  }

  actionEnabled() {
    var originalSplit = this.props.split;
    var originalColors = this.props.essence.colors;
    var newSplit = this.state.split;
    var newColors = this.state.colors;

    return !originalSplit.equals(newSplit) || (originalColors && !originalColors.equals(newColors));
  }

  render() {
    var { direction, containerStage, openOn, dimension, onClose } = this.props;
    var { split } = this.state;
    if (!dimension) return null;

    var menuSize = Stage.fromSize(250, 240);

    var menuControls: JSX.Element = null;
    if (split.bucketAction instanceof TimeBucketAction) {
      menuControls = this.renderTimeControls();
    } else {
      menuControls = this.renderStringControls();
    }

    return <BubbleMenu
      className="split-menu"
      direction={direction}
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
    >
      {menuControls}
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()}>OK</button>
        <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
      </div>
    </BubbleMenu>;
  }
}
