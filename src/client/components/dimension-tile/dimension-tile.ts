'use strict';
require('./dimension-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset, Set, SortAction } from 'plywood';
import { PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { setDragGhost } from '../../utils/dom/dom';
import { Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, SplitCombine } from '../../../common/models/index';
import { TileHeader } from '../tile-header/tile-header';
import { Checkbox } from '../checkbox/checkbox';
import { HighlightControls } from '../highlight-controls/highlight-controls';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';

const TOP_N = 100;

export interface DimensionTileProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;

  key?: string;
}

export interface DimensionTileState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  unfilter?: boolean;
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
      unfilter: false,
      showSearch: false
    };
  }

  fetchData(essence: Essence, dimension: Dimension, unfilter: boolean): void {
    var { dataSource } = essence;
    var measure = essence.getPinnedSortMeasure();

    var filter = essence.getEffectiveFilter();
    if (unfilter) {
      filter = filter.remove(dimension.expression);
    }

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.expression, dimension.name)
      .performAction(measure.toApplyAction())
      .sort($(measure.name), SortAction.DESCENDING)
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
    var { unfilter } = this.state;
    this.fetchData(essence, dimension, unfilter);
  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {
    var { essence, dimension } = this.props;
    var { unfilter } = this.state;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;
    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, null, unfilter ? dimension : null) ||
      essence.differentPinnedSort(nextEssence) ||
      !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension, unfilter);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  onRowClick(value: any) {
    var { clicker, essence, dimension } = this.props;
    var { filter } = essence;

    clicker.changeFilter(filter.remove(dimension.expression).addValue(dimension.expression, value));
  }

  onBoxClick(value: any, e: MouseEvent) {
    e.stopPropagation();
    var { clicker, essence, dimension } = this.props;
    var { filter } = essence;

    clicker.changeFilter(filter.toggleValue(dimension.expression, value));
  }

  onCollapse() {
    var { essence, dimension } = this.props;
    var { unfilter } = this.state;
    unfilter = !unfilter;
    this.setState({ unfilter });
    this.fetchData(essence, dimension, unfilter);
  }

  onDragStart(e: DragEvent) {
    var { essence, dimension } = this.props;

    var newUrl = essence.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame).getURL();

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
    var measure = essence.getPinnedSortMeasure();

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
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = d[dimensionName];
        var segmentValueStr = String(segmentValue);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);

        var className = 'row';
        var checkbox: React.ReactElement<any> = null;
        if (essence.filter.filteredOn(dimension.expression)) {
          var selected = essence.filter.filteredOnValue(dimension.expression, segmentValue);
          checkbox = React.createElement(Checkbox, {
            checked: selected,
            onClick: this.onBoxClick.bind(this, segmentValue)
          });
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
      maxHeight += Math.max(3, rows.length) * PIN_ITEM_HEIGHT;
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
        {searchBar}
        <div className="rows">{rows}</div>
        {queryError}
        {loader}
        <TileHeader
          title={dimension.title}
          onDragStart={this.onDragStart.bind(this)}
          onCollapse={this.onCollapse.bind(this)}
          onClose={clicker.unpin.bind(clicker, dimension)}
        />
      </div>
    `);
  }
}
