'use strict';
require('./dimension-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, r, Expression, Executor, Dataset, Set, SortAction } from 'plywood';
import { SEGMENT, PIN_TITLE_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM, MAX_SEARCH_LENGTH, SEARCH_WAIT } from '../../config/constants';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { setDragGhost, isInside, escapeKey } from '../../utils/dom/dom';
import { Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, SplitCombine, Colors } from '../../../common/models/index';
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

export interface DimensionTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  colors?: Colors;
}

export interface DimensionTileState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  fetchQueued?: boolean;
  unfolded?: boolean;
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
      unfolded: true,
      showSearch: false,
      searchText: ''
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      var { essence, dimension } = this.props;
      var { unfolded } = this.state;
      this.fetchData(essence, dimension, unfolded);
    });

    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  fetchData(essence: Essence, dimension: Dimension, unfolded: boolean): void {
    var { searchText } = this.state;
    var { dataSource, colors } = essence;
    var measure = essence.getPinnedSortMeasure();

    var filter = essence.getEffectiveFilter();
    if (unfolded) {
      filter = filter.remove(dimension.expression);
    }

    var filterExpression = filter.toExpression();

    if (colors && !unfolded) {
      filterExpression = filterExpression.and(dimension.expression.in(colors.toSet()));
    }

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
    var { unfolded } = this.state;
    this.fetchData(essence, dimension, unfolded);
  }

  componentWillReceiveProps(nextProps: DimensionTileProps) {
    var { essence, dimension } = this.props;
    var { unfolded } = this.state;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;
    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, null, unfolded ? dimension : null) ||
      essence.differentPinnedSort(nextEssence) ||
      essence.differentColors(nextEssence, false) ||
      !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension, unfolded);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var searchBoxElement = ReactDOM.findDOMNode(this.refs['search-box']);
    if (!searchBoxElement) return;

    var headerRef = this.refs['header'];
    if (!headerRef) return;
    var searchButtonElement = ReactDOM.findDOMNode(headerRef.refs['searchButton']);
    if (!searchButtonElement) return;

    var target = e.target as Element;

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
    var { clicker, essence, dimension, colors } = this.props;
    var { filter } = essence;

    if (colors && colors.dimension === dimension.name) {
      colors = colors.toggle(value);
      if (filter.filteredOn(dimension.expression)) {
        filter = filter.toggleValue(dimension.expression, value);
        clicker.changeFilter(filter, colors);
      } else {
        clicker.changeColors(colors);
      }

    } else {
      if (e.altKey) {
        if (filter.filteredOnValue(dimension.expression, value) && filter.getValues(dimension.expression).size() === 1) {
          filter = filter.remove(dimension.expression);
        } else {
          filter = filter.remove(dimension.expression).addValue(dimension.expression, value);
        }
      } else {
        filter = filter.toggleValue(dimension.expression, value);
      }

      // If no longer filtered switch unfolded to true for later
      var { unfolded } = this.state;
      if (!unfolded && !filter.filteredOn(dimension.expression)) {
        this.setState({ unfolded: true });
      }

      clicker.changeFilter(filter);
    }
  }

  toggleFold() {
    var { essence, dimension } = this.props;
    var { unfolded } = this.state;
    unfolded = !unfolded;
    this.setState({ unfolded });
    this.fetchData(essence, dimension, unfolded);
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
    var { clicker, essence, dimension, colors } = this.props;
    var { loading, dataset, error, showSearch, unfolded, fetchQueued, searchText } = this.state;
    var measure = essence.getPinnedSortMeasure();

    var measureName = measure.name;
    var filterSet = essence.filter.getValues(dimension.expression);

    var maxHeight = PIN_TITLE_HEIGHT;

    var searchBar: JSX.Element = null;
    if (showSearch) {
      searchBar = <div className="search-box" ref="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={this.onSearchChange.bind(this)}
        />
      </div>;
      maxHeight += SEARCH_BOX_HEIGHT + SEARCH_BOX_GAP;
    }

    var rows: Array<JSX.Element> = [];
    var folder: JSX.Element = null;
    var highlightControls: JSX.Element = null;
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);

      if (!unfolded && filterSet) {
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
      rows = rowData.map((d, i) => {
        var segmentValue = d[SEGMENT];
        var segmentValueStr = String(segmentValue);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);

        var className = 'row';
        var checkbox: JSX.Element = null;
        if (filterSet || colors) {
          var selected: boolean;
          if (colors) {
            selected = false;
            className += ' color';
          } else {
            selected = essence.filter.filteredOnValue(dimension.expression, segmentValue);
            className += ' ' + (selected ? 'selected' : 'not-selected');
          }
          checkbox = <Checkbox
            selected={selected}
            color={colors ? colors.getColor(segmentValue) : null}
          />;
        }

        var row = <div
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
        </div>;
        if (selected && highlightControls) highlightControls = null; // place only once
        return row;
      });
      maxHeight += Math.max(2, rows.length) * PIN_ITEM_HEIGHT;

      if (filterSet || colors) {
        folder = <div
          className={'folder ' + (unfolded ? 'folded' : 'unfolded')}
          onClick={this.toggleFold.bind(this)}
        >
          <SvgIcon svg={require('../../icons/caret.svg')}/>
          {unfolded ? 'Show selection' : 'Show all'}
        </div>;
        maxHeight += FOLDER_BOX_HEIGHT;
      }
    }

    maxHeight += PIN_PADDING_BOTTOM;

    var loader: JSX.Element = null;
    var message: JSX.Element = null;
    if (loading) {
      loader = <Loader/>;
    } else if (dataset && !fetchQueued && searchText && !rows.length) {
      message = <div className="message">{'No results for "' + searchText + '"'}</div>;
    }

    var queryError: JSX.Element = null;
    if (error) {
      queryError = <QueryError error={error}/>;
    }

    const className = [
      'dimension-tile',
      (searchBar ? 'has-search' : 'no-search'),
      (folder ? 'has-folder' : 'no-folder')
    ].join(' ');

    const style = {
      maxHeight
    };

    return <div className={className} style={style}>
      <TileHeader
        title={dimension.title}
        onDragStart={this.onDragStart.bind(this)}
        onSearch={this.toggleSearch.bind(this)}
        onClose={clicker.unpin.bind(clicker, dimension)}
        ref="header"
      />
      {searchBar}
      <div className="rows">
        {rows}
        {message}
      </div>
      {folder}
      {queryError}
      {loader}
    </div>;
  }
}
