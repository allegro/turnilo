'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuTimeSeries } from '../menu-time-series/menu-time-series';
import { MenuActionBar } from '../menu-action-bar/menu-action-bar';

interface PreviewMenuProps {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  onFilter: Function;
  onClose: Function;
}

interface PreviewMenuState {
  selectedValues?: List<any>;
  showSearch?: boolean;
  filterMode?: boolean;
  filteredDimension?: boolean;
}

export class PreviewMenu extends React.Component<PreviewMenuProps, PreviewMenuState> {

  constructor() {
    super();
    this.state = {
      selectedValues: <List<string>>List(),
      showSearch: false,
      filterMode: false,
      filteredDimension: false
    };
  }

  componentDidMount() {
    var { essence, dimension } = this.props;
    var selectedValues = essence.filter.getValues(dimension.expression);
    this.setState({
      selectedValues: List(selectedValues || []),
      filteredDimension: Boolean(selectedValues)
    });
  }

  onSearchClick() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  onValueClick(value: any) {
    var { selectedValues } = this.state;
    if (selectedValues.includes(value)) {
      selectedValues = <List<any>>selectedValues.filter(sv => sv !== value);
    } else {
      selectedValues = selectedValues.push(value);
    }
    this.setState({
      selectedValues,
      filterMode: true
    });
  }

  onFilterClick() {
    var { clicker, essence, dimension, onClose } = this.props;
    var { selectedValues } = this.state;
    clicker.changeFilter(essence.filter.setValues(dimension.expression, selectedValues.toArray()));
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { essence, clicker, direction, containerStage, openOn, dimension, onFilter, onClose } = this.props;
    var { selectedValues, showSearch, filterMode, filteredDimension } = this.state;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuVisualization: React.ReactElement<any> = null;
    var bottomBar: any = null;

    if (!filterMode) {
      bottomBar = JSX(`
        <MenuActionBar
          clicker={clicker}
          essence={essence}
          dimension={dimension}
          onFilter={onFilter}
          onClose={onClose}
        />
      `);
    }

    if (dimension.type === 'TIME') {
      menuSize = Stage.fromSize(350, 300);
      menuVisualization = React.createElement(MenuTimeSeries, {
        essence,
        dimension: dimension,
        stage: menuSize.within({ top: 40, bottom: 52 }) // ToDo: remove magic numbers
      });
    } else {
      menuSize = Stage.fromSize(250, 400);
      menuVisualization = React.createElement(MenuTable, {
        essence,
        dimension: dimension,
        showSearch,
        showCheckboxes: filteredDimension || filterMode,
        selectedValues,
        onValueClick: this.onValueClick.bind(this)
      });

      if (filterMode) {
        bottomBar = JSX(`
          <div className="button-bar">
            <div className="button filter" onClick={this.onFilterClick.bind(this)}>Filter</div>
            <div className="button cancel" onClick={this.onCancelClick.bind(this)}>Cancel</div>
          </div>
        `);
      }
    }

    //onSearchClick={this.onSearchClick.bind(this)}
    return JSX(`
      <BubbleMenu className="preview-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        <MenuHeader dimension={dimension}/>
        <div className="menu-cont">{menuVisualization}</div>
        {bottomBar}
      </BubbleMenu>
    `);
  }
}
