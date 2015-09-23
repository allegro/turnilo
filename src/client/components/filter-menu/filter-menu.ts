'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration, hour, day, week } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuTimeSeries } from '../menu-time-series/menu-time-series';
import { TimeInput } from '../time-input/time-input';

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

  componentDidMount() {
    var { essence, dimension } = this.props;

    var newState: FilterMenuState = {
      selectedTimeRange: null,
      selectedValues: null
    };

    if (dimension.type === 'TIME') {
      newState.selectedTimeRange = essence.getEffectiveFilter().getTimeRange(dimension.expression);
    } else {
      newState.selectedValues = List(essence.getEffectiveFilter().getValues(dimension.expression) || []);
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
    console.log('set start', start.toISOString());
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
    console.log('set end', end.toISOString());
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

  onFilterClick() {
    var { clicker, essence, dimension, insertPosition, replacePosition, onClose } = this.props;
    var { selectedTimeRange, selectedValues } = this.state;
    var { filter } = essence;
    var newFilter: Filter;

    if (dimension.type === 'TIME') {
      newFilter = filter.setTimeRange(dimension.expression, selectedTimeRange);
    } else {
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
    var { selectedTimeRange, selectedValues, showSearch } = this.state;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuCont: React.DOMElement<any> = null;
    if (dimension.type === 'TIME') {
      if (!selectedTimeRange) return null;
      var { timezone } = essence;

      var presets = getTimePresets(essence.dataSource.getMaxTime(), timezone);
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
            <Icon className="arrow" name="to-arrow"/>
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

    return JSX(`
      <BubbleMenu className="filter-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        {menuCont}
        <div className="button-bar">
          <button className="filter" onClick={this.onFilterClick.bind(this)}>Filter</button>
          <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
        </div>
      </BubbleMenu>
    `);
  }
}
