'use strict';
require('./filter-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, Duration, minute, hour, day, week } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuTimeSeries } from '../menu-time-series/menu-time-series';
import { TimeInput } from '../time-input/time-input';

function getTimePresets(now: Date, tz: Timezone) {
  var nowDayCeil = day.ceil(now, tz);
  var nowDayFloor = day.floor(now, tz);
  var nowMinuteCeil = minute.ceil(now, tz);
  return [
    TimePreset.fromJS({
      name: 'Past hour',
      timeRange: {
        start: hour.move(nowMinuteCeil, tz, -1),
        end: nowMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: 'Past 6 hours',
      timeRange: {
        start: hour.move(nowMinuteCeil, tz, -6),
        end: nowMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: 'Past 24 hours',
      timeRange: {
        start: hour.move(nowMinuteCeil, tz, -24),
        end: nowMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: 'Current day',
      timeRange: {
        start: day.move(nowDayCeil, tz, -1),
        end: nowDayCeil
      }
    }),
    TimePreset.fromJS({
      name: 'Past 7 days',
      timeRange: {
        start: day.move(nowDayFloor, tz, -7),
        end: nowDayFloor
      }
    }),
    TimePreset.fromJS({
      name: 'This week',
      timeRange: {
        start: week.floor(nowDayFloor, tz),
        end: nowDayFloor
      }
    })
  ];
}

export interface FilterMenuProps {
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

export interface FilterMenuState {
  selectedTimeRange?: TimeRange;
  selectedValues?: List<any>;
  showSearch?: boolean;
}

export class FilterMenu extends React.Component<FilterMenuProps, FilterMenuState> {

  constructor() {
    super();
    this.state = {
      selectedTimeRange: null,
      selectedValues: null,
      showSearch: false
    };
  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter } = essence;

    var newState: FilterMenuState = {
      selectedTimeRange: null,
      selectedValues: null
    };

    if (dimension.type === 'TIME') {
      newState.selectedTimeRange = filter.getTimeRange(dimension.expression);
    } else {
      newState.selectedValues = List(filter.getValues(dimension.expression) || []);
    }

    this.setState(newState);
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

  timeRangeStartChange(start: Date) {
    if (!start) return;
    var { selectedTimeRange } = this.state;
    this.setState({
      selectedTimeRange: new TimeRange({
        start,
        end: selectedTimeRange.end
      })
    });
  }

  timeRangeEndChange(end: Date) {
    if (!end) return;
    var { selectedTimeRange } = this.state;
    this.setState({
      selectedTimeRange: new TimeRange({
        start: selectedTimeRange.start,
        end
      })
    });
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

  constructFilter(): Filter {
    var { essence, dimension, insertPosition, replacePosition } = this.props;
    var { selectedTimeRange, selectedValues } = this.state;
    var { filter } = essence;

    if (dimension.type === 'TIME') {
      return filter.setTimeRange(dimension.expression, selectedTimeRange);
    } else {
      if (selectedValues.size) {
        var clause = dimension.expression.in(selectedValues.toArray());
        if (insertPosition !== null) {
          return filter.insertByIndex(insertPosition, clause);
        } else if (replacePosition !== null) {
          return filter.replaceByIndex(replacePosition, clause);
        } else {
          return filter.setClause(clause);
        }
      } else {
        return filter.remove(dimension.expression);
      }
    }
  }

  onFilterClick() {
    var { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { essence, direction, containerStage, openOn, dimension, onClose } = this.props;
    var { selectedTimeRange, selectedValues, showSearch } = this.state;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuCont: React.DOMElement<any> = null;
    if (dimension.type === 'TIME') {
      if (!selectedTimeRange) return null;
      var { timezone } = essence;

      var presets = getTimePresets(essence.dataSource.getMaxTimeDate(), timezone);
      var presetList = presets.map((preset) => {
        var selected = selectedTimeRange.equals(preset.timeRange);
        return JSX(`
          <li
            key={preset.name}
            className={selected ? 'selected' : null}
            onClick={this.onPresetClick.bind(this, preset)}
          >{preset.name}</li>
        `);
      });

      menuSize = Stage.fromSize(450, 220);
      var menuVisSize = Stage.fromSize(300, 120);
      menuCont = JSX(`
        <div className="menu-cont time-filter">
          <ul>{presetList}</ul>
          <div className="time-inputs">
            <TimeInput time={selectedTimeRange.start} timezone={timezone} onChange={this.timeRangeStartChange.bind(this)}/>
            <SvgIcon className="arrow" svg={require('../../icons/to-arrow.svg')}/>
            <TimeInput time={selectedTimeRange.end} timezone={timezone} onChange={this.timeRangeEndChange.bind(this)}/>
          </div>
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
    }

    var actionDisabled = essence.filter.equals(this.constructFilter());

    return JSX(`
      <BubbleMenu className="filter-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        {menuCont}
        <div className="button-bar">
          <button className="filter" onClick={this.onFilterClick.bind(this)} disabled={actionDisabled}>Filter</button>
          <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
        </div>
      </BubbleMenu>
    `);
  }
}
