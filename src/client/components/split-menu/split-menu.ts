'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, RefExpression, Executor, Dataset, TimeBucketAction, SortAction, LimitAction } from 'plywood';
import { Stage, Clicker, Essence, DataSource, SplitCombine, Filter, Dimension, Measure, DimensionOrMeasure } from '../../../common/models/index';
import { SEGMENT } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown, DropdownProps } from '../dropdown/dropdown';

const GRANULARITIES = ['PT1M', 'PT1H', 'P1D', 'P7D'];

function mdEqual(m1: DimensionOrMeasure, m2: DimensionOrMeasure): boolean {
  return m1 === m2 || (<any>m1).equals(m2);
}

function mdName(measure: DimensionOrMeasure): string {
  return measure.name;
}

function mdTitle(measure: DimensionOrMeasure): string {
  return measure.title;
}

export interface SplitMenuProps {
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
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      split: null
    };

  }

  componentWillMount() {
    var { split } = this.props;
    this.setState({ split });
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

  onSelectSortDimensionOrMeasure(dimensionOrMeasure: DimensionOrMeasure): void {
    var { split } = this.state;
    var sortAction = split.sortAction;
    var direction = sortAction ? sortAction.direction : 'descending';
    var sortOn = Measure.isMeasure(dimensionOrMeasure) ? dimensionOrMeasure.name : SEGMENT;
    this.setState({
      split: split.changeSortAction(new SortAction({
        expression: $(sortOn),
        direction
      }))
    });
  }

  onSelectLimit(limit: number): void {
    var { split } = this.state;
    this.setState({
      split: split.changeLimit(limit)
    });
  }

  onOkClick() {
    var { clicker, essence, onClose } = this.props;
    var originalSplit = this.props.split;
    var newSplit = this.state.split;
    if (!originalSplit.equals(newSplit)) {
      clicker.changeSplits(essence.splits.replace(originalSplit, newSplit), false);
    }
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  getSortDimensionOrMeasure(): DimensionOrMeasure {
    var { essence, dimension } = this.props;
    var { split } = this.state;
    var { sortAction} = split;
    if (!sortAction) return dimension;
    var sortOn = (<RefExpression>sortAction.expression).name;
    if (sortOn === SEGMENT) return dimension;
    return essence.dataSource.getMeasure(sortOn);
  }

  renderGranularityPicker() {
    var { split } = this.state;
    var selectedGran = (<TimeBucketAction>split.bucketAction).duration.toString();

    var buttons = GRANULARITIES.map(g => {
      return JSX(`
        <li
          className={'granularity' + (g === selectedGran ? ' selected' : '')}
          key={g}
          onClick={this.onSelectGran.bind(this, g)}
        >{g}</li>
      `);
    });

    return JSX(`
      <div className="button-group">
        <div className="button-group-title">Granularity</div>
        <ul>{buttons}</ul>
      </div>
    `);
  }

  renderSortDropdown() {
    var { essence, dimension } = this.props;
    var { split } = this.state;

    var mds = [(<DimensionOrMeasure>dimension)].concat(essence.dataSource.measures.toArray());
    var md = this.getSortDimensionOrMeasure();

    return React.createElement(Dropdown, <DropdownProps<DimensionOrMeasure>>{
      label: "Sort by",
      items: mds,
      selectedItem: md,
      equal: mdEqual,
      renderItem: mdTitle,
      keyItem: mdName,
      onSelect: this.onSelectSortDimensionOrMeasure.bind(this)
    });
  }

  renderTimeControls() {
    return JSX(`
      <div>
        {this.renderGranularityPicker()}
        {this.renderSortDropdown()}
      </div>
    `);
  }

  renderStringControls() {
    var { split } = this.state;

    var { limitAction } = split;
    var limitDropdown = React.createElement(Dropdown, <DropdownProps<number>>{
      label: "Limit",
      items: [5, 10, 25, 50, 100],
      selectedItem: limitAction ? limitAction.limit : null,
      onSelect: this.onSelectLimit.bind(this)
    });

    return JSX(`
      <div>
        {this.renderSortDropdown()}
        {limitDropdown}
      </div>
    `);
  }

  render() {
    var { direction, containerStage, openOn, dimension, onClose } = this.props;
    var { split } = this.state;
    if (!dimension) return null;

    var menuSize = Stage.fromSize(250, 200);

    var menuControls: React.DOMElement<any> = null;
    if (split.bucketAction instanceof TimeBucketAction) {
      menuControls = this.renderTimeControls();
    } else {
      menuControls = this.renderStringControls();
    }

    return JSX(`
      <BubbleMenu className="split-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        {menuControls || 'Split controls coming soon.'}
        <div className="button-bar">
          <button className="ok" onClick={this.onOkClick.bind(this)}>OK</button>
          <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
        </div>
      </BubbleMenu>
    `);
  }
}
