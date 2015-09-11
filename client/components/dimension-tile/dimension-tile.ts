'use strict';

import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset, Set } from 'plywood';
import { PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { formatterFromData } from '../../utils/formatter';
import { setDragGhost } from '../../utils/dom';
import { Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';
import { Checkbox } from '../checkbox/checkbox';
import { HighlightControls } from '../highlight-controls/highlight-controls';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';

const HIGHLIGHT_ID = 'dim-tile:';
const TOP_N = 100;

interface DimensionTileProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
}

interface DimensionTileState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  showSearch?: boolean;
}

export class DimensionTile extends React.Component<DimensionTileProps, DimensionTileState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      showSearch: false
    };
  }

  fetchData(essence: Essence, dimension: Dimension): void {
    var { dataSource } = essence;
    var measure = dataSource.getSortMeasure(dimension);
    var highlightId = HIGHLIGHT_ID + dimension.name;

    var query: any = $('main')
      .filter(essence.getEffectiveFilter(highlightId).toExpression())
      .split(dimension.expression, dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(measure.name), 'descending')
      .limit(TOP_N + 1);

    this.setState({ loading: true });
    dataSource.executor(query)
      .then(
        (dataset) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentDidMount() {
    this.mounted = true;
    var { essence, dimension } = this.props;
    this.fetchData(essence, dimension);
  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {
    var { essence, dimension } = this.props;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;
    var highlightId = HIGHLIGHT_ID + nextDimension.name;
    if (
      essence.differentEffectiveFilter(nextEssence, highlightId) ||
      !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension);
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

  onRowClick(value: any) {
    var { clicker, essence, dimension } = this.props;
    var highlightId = HIGHLIGHT_ID + dimension.name;

    if (essence.highlightOn(highlightId)) {
      var highlightSet = essence.getSingleHighlightValue();
      if (highlightSet.size() === 1 && highlightSet.contains(value)) {
        clicker.dropHighlight();
        return;
      }
    }

    clicker.changeHighlight(highlightId, Filter.fromClause(dimension.expression.in([value])));
  }

  onDragStart(e: DragEvent) {
    var { essence, dimension } = this.props;

    var newUrl = essence.changeSplit(dimension.getSplitCombine()).getURL();

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';
    dataTransfer.setData("text/url-list", newUrl);
    dataTransfer.setData("text/plain", newUrl);
    dataTransfer.setData("dimension/" + dimension.name, JSON.stringify(dimension));
    setDragGhost(dataTransfer, dimension.title);
  }

  render() {
    var { clicker, essence, dimension } = this.props;
    var { loading, dataset, error, showSearch } = this.state;
    var { dataSource, filter } = essence;
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
    var highlightControls: React.ReactElement<any> = null;
    var hasMore = false;
    if (dataset) {
      var highlightId = HIGHLIGHT_ID + dimension.name;
      var highlightSet: Set = null;
      if (essence.highlightOn(highlightId)) {
        highlightSet = essence.getSingleHighlightValue();
        highlightControls = React.createElement(HighlightControls, { clicker });
      }

      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = d[dimensionName];
        var segmentValueStr = String(segmentValue);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);
        var selected = highlightSet && highlightSet.contains(segmentValue);

        var checkbox: React.ReactElement<any> = null;
        if (false) {
          checkbox = React.createElement(Checkbox, {
            checked: selected
            //onClick: this.onBoxClick.bind(this, segmentValue)
          });
        }

        var className = 'row';
        if (highlightSet) {
          className += ' ' + (selected ? 'selected' : 'not-selected');
        }

        var row = JSX(`
          <div
            className={className}
            key={segmentValueStr}
            onClick={this.onRowClick.bind(this, segmentValue)}
          >
            <div className="segment-value" title={segmentValue}>
              {checkbox}
              <div className="label" title={segmentValueStr}>{segmentValueStr}</div>
            </div>
            <div className="measure-value">{measureValueStr}</div>
            {selected ? highlightControls : null}
          </div>
        `);
        if (selected && highlightControls) highlightControls = null; // place only once
        return row;
      });
      maxHeight += Math.max(2, rows.length) * PIN_ITEM_HEIGHT;
    }

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    var queryError: React.ReactElement<any> = null;
    if (error) {
      queryError = React.createElement(QueryError, { error });
    }

    maxHeight += PIN_PADDING_BOTTOM;

    const className = [
      'dimension-tile',
      (showSearch ? 'with-search' : 'no-search')
    ].join(' ');

    const style = {
      maxHeight
    };

    // onSearch={this.toggleSearch.bind(this)}
    return JSX(`
      <div className={className} style={style}>
        <TileHeader
          title={dimension.title}
          onDragStart={this.onDragStart.bind(this)}
          onClose={clicker.unpin.bind(clicker, dimension)}
        />
        {searchBar}
        <div className="rows">{rows}</div>
        {queryError}
        {loader}
      </div>
    `);
  }
}
