'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { Timezone, Duration, hour, day, week } from 'chronoshift';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuTimeSeries } from '../menu-time-series/menu-time-series';

function getTimePresets(now: Date, tz: Timezone) {
  return [
    TimePreset.fromJS({
      name: 'Past hour',
      timeRange: {
        start: hour.move(now, tz, -1),
        end: now
      }
    }),
    TimePreset.fromJS({
      name: 'Past 6 hours',
      timeRange: {
        start: hour.move(hour.floor(now, tz), tz, -5),
        end: now
      }
    }),
    TimePreset.fromJS({
      name: 'Past day',
      timeRange: {
        start: day.move(now, tz, -1),
        end: now
      }
    }),
    TimePreset.fromJS({
      name: 'Past 7 days',
      timeRange: {
        start: day.move(day.floor(now, tz), tz, -6),
        end: now
      }
    }),
    TimePreset.fromJS({
      name: 'This week',
      timeRange: {
        start: week.floor(now, tz),
        end: now
      }
    })
  ];
}

interface FilterMenuProps {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  insertPosition: number;
  replacePosition: number;
  onClose: Function;
}

interface FilterMenuState {
  selectedValues?: List<any>;
  showSearch?: boolean;
}

export class FilterMenu extends React.Component<FilterMenuProps, FilterMenuState> {

  constructor() {
    super();
    this.state = {
      selectedValues: <List<string>>List(),
      showSearch: false
    };
  }

  componentDidMount() {
    var { essence, dimension } = this.props;
    this.setState({
      selectedValues: List(essence.filter.getValues(dimension.expression) || [])
    });
  }

  onSearchClick() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  onPresetClick(preset: TimePreset) {
    var { clicker, onClose } = this.props;
    clicker.changeTimeRange(preset.timeRange);
    onClose();
  }

  onValueClick(value: any) {
    var { selectedValues } = this.state;
    if (selectedValues.includes(value)) {
      selectedValues = <List<any>>selectedValues.filter(sv => sv !== value);
    } else {
      selectedValues = selectedValues.push(value);
    }
    this.setState({ selectedValues });
  }

  onFilterClick() {
    var { clicker, essence, dimension, insertPosition, replacePosition, onClose } = this.props;
    var { selectedValues } = this.state;
    var { filter } = essence;
    var newFilter: Filter;

    if (selectedValues.size) {
      var clause = dimension.expression.in(selectedValues.toArray());
      if (insertPosition !== null) {
        newFilter = filter.insertByIndex(insertPosition, clause);
      } else if (replacePosition !== null) {
        newFilter = filter.replaceByIndex(replacePosition, clause);
      } else {
        newFilter = filter.setClause(clause);
      }
    } else {
      newFilter = filter.remove(dimension.expression);
    }
    clicker.changeFilter(newFilter);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { essence, direction, containerStage, openOn, dimension, onClose } = this.props;
    var { selectedValues, showSearch } = this.state;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuCont: React.DOMElement<any> = null;
    var bottomBar: React.DOMElement<any> = null;
    if (dimension.type === 'TIME') {
      var presets = getTimePresets(essence.dataSource.getMaxTime(), essence.timezone);
      var presetList = presets.map((preset) => {
        return JSX(`
          <li key={preset.name} onClick={this.onPresetClick.bind(this, preset)}>
            {preset.name}
          </li>
        `);
      });

      menuSize = Stage.fromSize(550, 300);
      var menuVisSize = menuSize.within({ left: 200, top: 40, bottom: 52 });  // ToDo: remove magic numbers
      menuCont = JSX(`
        <div className="menu-cont presets">
          <ul>{presetList}</ul>
          <MenuTimeSeries
            essence={essence}
            dimension={dimension}
            stage={menuVisSize}
          />
        </div>
      `);
    } else {
      menuSize = Stage.fromSize(250, 400);
      menuCont = JSX(`
        <div className="menu-cont">
          <MenuTable
            essence={essence}
            dimension={dimension}
            showSearch={showSearch}
            showCheckboxes={true}
            selectedValues={selectedValues}
            onValueClick={this.onValueClick.bind(this)}
          />
        </div>
      `);

      bottomBar = JSX(`
        <div className="button-bar">
          <div className="button filter" onClick={this.onFilterClick.bind(this)}>Filter</div>
          <div className="button cancel" onClick={this.onCancelClick.bind(this)}>Cancel</div>
        </div>
      `);
    }

    return JSX(`
      <BubbleMenu className="filter-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        <MenuHeader dimension={dimension}/>
        {menuCont}
        {bottomBar}
      </BubbleMenu>
    `);
  }
}
