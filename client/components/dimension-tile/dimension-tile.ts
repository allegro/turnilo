'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { formatterFromData } from '../../utils/formatter';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';
import { Checkbox } from '../checkbox/checkbox';


const TOP_N = 100;

interface DimensionTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  dimension: Dimension;
}

interface DimensionTileState {
  dataset?: Dataset;
  selectedValues?: string[];
  showSearch?: boolean;
}

export class DimensionTile extends React.Component<DimensionTileProps, DimensionTileState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null,
      selectedValues: [],
      showSearch: false
    };
  }

  fetchData(filter: Filter, dimension: Dimension) {
    var { dataSource } = this.props;
    var measure = dataSource.getSortMeasure(dimension);

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.expression, dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(measure.name), 'descending')
      .limit(TOP_N + 1);

    dataSource.dispatcher(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { filter, dimension } = this.props;
    this.fetchData(filter, dimension);
  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {
    var props = this.props;
    if (
      props.filter !== nextProps.filter ||
      props.dimension !== nextProps.dimension
    ) {
      this.fetchData(nextProps.filter, nextProps.dimension);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  selectFilter(filter: Filter) {
    var { clicker } = this.props;
    clicker.changeFilter(filter);
  }

  onBoxClick(value: any, e: MouseEvent) {
    e.stopPropagation();
    var { filter, dimension } = this.props;
    var { selectedValues } = this.state;
    if (selectedValues.indexOf(value) > -1) {
      selectedValues = selectedValues.filter(selectedValue => selectedValue !== value);
    } else {
      selectedValues = selectedValues.concat([value]);
    }
    this.setState({ selectedValues });
    this.selectFilter(filter.setValues(dimension.expression, selectedValues));
  }

  onValueClick(value: any) {
    var { filter, dimension } = this.props;
    var { selectedValues } = this.state;
    this.setState({
      selectedValues: [value]
    });
    this.selectFilter(filter.add(dimension.expression, value));
  }

  render() {
    var { clicker, dataSource, filter, dimension } = this.props;
    var { showSearch, dataset, selectedValues } = this.state;
    var measure = dataSource.getSortMeasure(dimension);

    var dimensionName = dimension.name;
    var measureName = measure.name;

    var maxHeight = PIN_TITLE_HEIGHT;

    var searchBar: React.DOMElement<any> = null;
    if (showSearch) {
      searchBar = JSX(`<div className="search-box"><input type="text" placeholder="Search"/></div>`);
      maxHeight += SEARCH_BOX_HEIGHT;
    }

    var rows: Array<React.DOMElement<any>> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = String(d[dimensionName]);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);
        var selected = selectedValues.indexOf(segmentValue) > -1;

        var checkbox: React.ReactElement<any> = null;
        if (false) {
          checkbox = React.createElement(Checkbox, {
            checked: selected
          //  onClick: this.onBoxClick.bind(this, segmentValue)
          });
        }

        return JSX(`
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValue}>
            <div className="segment-value" onClick={this.onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{segmentValue}</div>
            </div>
            <div className="measure-value">{measureValueStr}</div>
          </div>
        `);
      });
      maxHeight += rows.length * PIN_ITEM_HEIGHT;
    }

    maxHeight += PIN_PADDING_BOTTOM;

    const className = [
      'dimension-tile',
      (showSearch ? 'with-search' : 'no-search')
    ].join(' ');

    const style = {
      maxHeight
    };

    return JSX(`
      <div className={className} style={style}>
        <TileHeader
          title={dimension.title}
          onSearch={this.toggleSearch.bind(this)}
          onClose={clicker.unpin.bind(clicker, dimension)}
        />
        {searchBar}
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
