'use strict';
require('./dimension-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, r, Expression, Executor, Dataset, Set, SortAction } from 'plywood';
import { SEGMENT, PIN_TITLE_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM, MAX_SEARCH_LENGTH, SEARCH_WAIT } from '../../config/constants';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { setDragGhost, isInside, escapeKey } from '../../utils/dom/dom';
import { Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, SplitCombine } from '../../../common/models/index';
import { collect } from '../../../common/utils/general/general';
import { TileHeader } from '../tile-header/tile-header';
import { ClearableInput } from '../clearable-input/clearable-input';
import { Checkbox } from '../checkbox/checkbox';
import { HighlightControls } from '../highlight-controls/highlight-controls';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';
import { HighlightString } from '../highlight-string/highlight-string';

const TOP_N = 100;
const SEARCH_BOX_HEIGHT = 26;
const SEARCH_BOX_GAP = 3;
const FOLDER_BOX_HEIGHT = 30;

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
  fetchQueued?: boolean;
  unfilter?: boolean;
  showSearch?: boolean;
  searchText?: string;
}

export class DimensionTile extends React.Component<DimensionTileProps, DimensionTileState> {
  public mounted: boolean;
  public collectTriggerSearch: Function;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      fetchQueued: false,
      unfilter: true,
      showSearch: false,
      searchText: ''
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      var { essence, dimension } = this.props;
      var { unfilter } = this.state;
      this.fetchData(essence, dimension, unfilter);
    });

    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  fetchData(essence: Essence, dimension: Dimension, unfilter: boolean): void {
    var { searchText } = this.state;
    var { dataSource } = essence;
    var measure = essence.getPinnedSortMeasure();

    var filter = essence.getEffectiveFilter();
    if (unfilter) {
      filter = filter.remove(dimension.expression);
    }

    var filterExpression = filter.toExpression();
    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), 'ignoreCase'));
    }

    var query: any = $('main')
      .filter(filterExpression)
      .split(dimension.expression, SEGMENT)
      .performAction(measure.toApplyAction())
      .sort($(measure.name), SortAction.DESCENDING)
      .limit(TOP_N + 1);

    this.setState({
      loading: true,
      fetchQueued: false
    });
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
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
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
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    // can not use ReactDOM.findDOMNode(this) because portal?
    var searchBoxRef = this.refs['search-box'];
    if (!searchBoxRef) return;
    var searchBoxElement = ReactDOM.findDOMNode(searchBoxRef);
    if (!searchBoxElement) return;

    var headerRef = this.refs['header'];
    if (!headerRef) return;
    var searchButtonRef = headerRef.refs['searchButton'];
    if (!searchButtonRef) return;
    var searchButtonElement = ReactDOM.findDOMNode(searchButtonRef);
    if (!searchButtonElement) return;

    var target = <Element>e.target;

    if (isInside(target, searchBoxElement) || isInside(target, searchButtonElement)) return;

    var { searchText } = this.state;
    // Remove search if it looses focus while empty
    if (searchText !== '') return;
    this.toggleSearch();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { showSearch } = this.state;
    if (!showSearch) return;
    this.toggleSearch();
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
    this.onSearchChange('');
  }

  onRowClick(value: any, e: MouseEvent) {
    var { clicker, essence, dimension } = this.props;
    var { filter } = essence;

    if (e.altKey) {
      if (filter.filteredOnValue(dimension.expression, value) && filter.getValues(dimension.expression).size() === 1) {
        filter = filter.remove(dimension.expression);
      } else {
        filter = filter.remove(dimension.expression).addValue(dimension.expression, value);
      }
    } else {
      filter = filter.toggleValue(dimension.expression, value);
    }

    var { unfilter } = this.state;
    if (!unfilter && !filter.filteredOn(dimension.expression)) {
      this.setState({ unfilter: true });
    }

    clicker.changeFilter(filter);
  }

  toggleFold() {
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

  onSearchChange(text: string) {
    var { searchText, dataset, fetchQueued, loading } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
    if (newSearchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < TOP_N) {
      this.setState({
        searchText: newSearchText
      });
      return;
    }

    this.setState({
      searchText: newSearchText,
      fetchQueued: true
    });
    this.collectTriggerSearch();
  }

  render() {
    var { clicker, essence, dimension } = this.props;
    var { loading, dataset, error, showSearch, unfilter, searchText } = this.state;
    var measure = essence.getPinnedSortMeasure();

    var measureName = measure.name;
    var filterSet = essence.filter.getValues(dimension.expression);

    var maxHeight = PIN_TITLE_HEIGHT;

    var searchBar: React.DOMElement<any> = null;
    if (showSearch) {
      searchBar = JSX(`
        <div className="search-box" ref="search-box">
          <ClearableInput
            placeholder="Search"
            focusOnMount={true}
            value={searchText}
            onChange={this.onSearchChange.bind(this)}
          />
        </div>
      `);
      maxHeight += SEARCH_BOX_HEIGHT + SEARCH_BOX_GAP;
    }

    var rows: Array<React.DOMElement<any>> = [];
    var foldUnfold: React.DOMElement<any> = null;
    var highlightControls: React.ReactElement<any> = null;
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);

      if (!unfilter && filterSet) {
        rowData = rowData.filter((d) => {
          return filterSet.contains(d[SEGMENT]);
        });
      }

      if (searchText) {
        var searchTextLower = searchText.toLowerCase();
        rowData = rowData.filter((d) => {
          return String(d[SEGMENT]).toLowerCase().indexOf(searchTextLower) !== -1;
        });
      }

      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = d[SEGMENT];
        var segmentValueStr = String(segmentValue);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);

        var className = 'row';
        var checkbox: React.ReactElement<any> = null;
        if (filterSet) {
          var selected = essence.filter.filteredOnValue(dimension.expression, segmentValue);
          className += ' ' + (selected ? 'selected' : 'not-selected');
          checkbox = React.createElement(Checkbox, {
            checked: selected
          });
        }

        var row = JSX(`
          <div
            className={className}
            key={segmentValueStr}
            onClick={this.onRowClick.bind(this, segmentValue)}
          >
            <div className="segment-value" title={segmentValueStr}>
              {checkbox}
              <HighlightString className="label" text={segmentValueStr} highlightText={searchText}/>
            </div>
            <div className="measure-value">{measureValueStr}</div>
            {selected ? highlightControls : null}
          </div>
        `);
        if (selected && highlightControls) highlightControls = null; // place only once
        return row;
      });
      maxHeight += Math.max(2, rows.length) * PIN_ITEM_HEIGHT;

      if (filterSet) {
        foldUnfold = JSX(`
          <div
            className={'folder ' + (unfilter ? 'folded' : 'unfolded')}
            onClick={this.toggleFold.bind(this)}
          >
            <SvgIcon svg={require('../../icons/caret.svg')}/>
            {unfilter ? 'Fold' : 'Unfold'}
          </div>
        `);
        maxHeight += FOLDER_BOX_HEIGHT;
      }
    }

    maxHeight += PIN_PADDING_BOTTOM;

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    var queryError: React.ReactElement<any> = null;
    if (error) {
      queryError = React.createElement(QueryError, { error });
    }

    const className = [
      'dimension-tile',
      (showSearch ? 'has-search' : 'no-search'),
      (filterSet ? 'has-filter' : 'no-filter')
    ].join(' ');

    const style = {
      maxHeight
    };

    return JSX(`
      <div className={className} style={style}>
        <TileHeader
          title={dimension.title}
          onDragStart={this.onDragStart.bind(this)}
          onSearch={this.toggleSearch.bind(this)}
          onClose={clicker.unpin.bind(clicker, dimension)}
          ref="header"
        />
        {searchBar}
        <div className="rows">{rows}</div>
        {foldUnfold}
        {queryError}
        {loader}
      </div>
    `);
  }
}
