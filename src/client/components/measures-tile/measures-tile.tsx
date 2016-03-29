require('./measures-tile.css');

import * as React from 'react';
import { STRINGS, PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, MEASURE_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { Checkbox, CheckboxType } from '../checkbox/checkbox';
import { TileHeader, TileHeaderIcon } from '../tile-header/tile-header';

export interface MeasuresTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
}

export interface MeasuresTileState {
  showSearch?: boolean;
}

export class MeasuresTile extends React.Component<MeasuresTileProps, MeasuresTileState> {

  constructor() {
    super();
    this.state = {
      showSearch: false
    };
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  measureClick(measure: Measure, e: MouseEvent) {
    if (e.altKey && typeof console !== 'undefined') {
      console.log(`Measure: ${measure.name}`);
      console.log(`expression: ${measure.expression.toString()}`);
      return;
    }
    var { clicker } = this.props;
    clicker.toggleEffectiveMeasure(measure);
  }

  render() {
    var { clicker, essence } = this.props;
    var { showSearch } = this.state;
    var { dataSource } = essence;
    var multiMeasureMode = essence.getEffectiveMultiMeasureMode();
    var selectedMeasures = essence.getEffectiveSelectedMeasure();

    var maxHeight = PIN_TITLE_HEIGHT;

    var checkboxType: CheckboxType = multiMeasureMode ? 'check' : 'radio';
    var rows = dataSource.measures.map(measure => {
      var measureName = measure.name;
      var selected = selectedMeasures.has(measureName);

      return <div
        className={classNames('row', { selected })}
        key={measureName}
        onClick={this.measureClick.bind(this, measure)}
      >
        <Checkbox type={checkboxType} selected={selected}/>
        <div className="label">{measure.title}</div>
      </div>;
    });
    maxHeight += (rows.size + 2) * MEASURE_HEIGHT + PIN_PADDING_BOTTOM;

    const style = {
      flex: rows.size + 2,
      maxHeight
    };

    var icons: TileHeaderIcon[] = [];

    if (!essence.isFixedMeasureMode()) {
      icons.push({
        name: 'multi',
        onClick: clicker.toggleMultiMeasureMode,
        svg: require('../../icons/full-multi.svg'),
        active: multiMeasureMode
      });
    }

    // More icons to add later
    //{ name: 'more', onClick: null, svg: require('../../icons/full-more-mini.svg') }
    //{ name: 'search', onClick: null, svg: require('../../icons/full-search.svg') }

    return <div className="measures-tile" style={style}>
      <TileHeader
        title={STRINGS.measures}
        icons={icons}
      />
      <div className="rows">{rows}</div>
    </div>;
  }
}
