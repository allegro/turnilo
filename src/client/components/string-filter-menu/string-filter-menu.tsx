require('./string-filter-menu.css');

import * as React from 'react';
import { $, ply, r, Expression, Executor, Dataset, SortAction, Set, Datum } from 'plywood';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS, MAX_SEARCH_LENGTH, SEARCH_WAIT } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, FilterClause, FilterMode, Dimension, Measure, Colors, DragPosition } from '../../../common/models/index';
import { collect } from '../../../common/utils/general/general';
import { enterKey, classNames } from '../../utils/dom/dom';
import { ClearableInput } from '../clearable-input/clearable-input';
import { Checkbox, CheckboxType } from '../checkbox/checkbox';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';
import { HighlightString } from '../highlight-string/highlight-string';
import { Button } from '../button/button';
import { Dropdown, DropdownProps } from "../dropdown/dropdown";
import { SvgIcon } from '../svg-icon/svg-icon';
import { FilterOptionsDropdown } from '../filter-options-dropdown/filter-options-dropdown';

const TOP_N = 100;

export interface StringFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  changePosition: DragPosition;
  onClose: Fn;
}

export interface StringFilterMenuState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  fetchQueued?: boolean;
  searchText?: string;
  selectedValues?: Set;
  promotedValues?: Set; // initial selected values
  colors?: Colors;
  filterMode?: FilterMode;
}

export class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {
  public mounted: boolean;
  public collectTriggerSearch: Fn;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      fetchQueued: false,
      searchText: '',
      selectedValues: null,
      promotedValues: null,
      colors: null
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      var { essence, dimension } = this.props;
      this.fetchData(essence, dimension);
    });

    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  fetchData(essence: Essence, dimension: Dimension): void {
    var { searchText } = this.state;
    var { dataSource } = essence;
    var nativeCount = dataSource.getMeasure('count');
    var measureExpression = nativeCount ? nativeCount.expression : $('main').count();

    var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), 'ignoreCase'));
    }

    var query = $('main')
      .filter(filterExpression)
      .split(dimension.expression, dimension.name)
      .apply('MEASURE', measureExpression)
      .sort($('MEASURE'), SortAction.DESCENDING)
      .limit(TOP_N + 1);

    this.setState({
      loading: true,
      fetchQueued: false
    });
    dataSource.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
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

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter, colors } = essence;

    var myColors = (colors && colors.dimension === dimension.name ? colors : null);

    var valueSet = filter.getLiteralSet(dimension.expression);
    var selectedValues = valueSet || (myColors ? myColors.toSet() : null) || Set.EMPTY;
    this.setState({
      selectedValues: selectedValues,
      promotedValues: selectedValues,
      colors: myColors
    });

    this.fetchData(essence, dimension);

    if (colors) {
      this.setState({filterMode: Filter.INCLUDED});
    } else {
      var filterMode = essence.filter.getModeForDimension(dimension);
      if (filterMode) this.setState({filterMode});
    }
  }

  // This is never called : either the component is open and nothing else can update its props,
  // or it's closed and doesn't exist.
  componentWillReceiveProps(nextProps: StringFilterMenuProps) {
    var { essence, dimension } = this.props;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;

    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, null, nextDimension) || !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension);
    }
  }

  componentDidMount() {
    this.mounted = true;
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    var { essence, dimension, changePosition } = this.props;
    var { selectedValues, filterMode } = this.state;
    var { filter } = essence;

    if (selectedValues.size()) {
      var clause = new FilterClause({
        expression: dimension.expression,
        selection: r(selectedValues),
        exclude: filterMode === Filter.EXCLUDED
      });
      if (changePosition) {
        if (changePosition.isInsert()) {
          return filter.insertByIndex(changePosition.insert, clause);
        } else {
          return filter.replaceByIndex(changePosition.replace, clause);
        }
      } else {
        return filter.setClause(clause);
      }
    } else {
      return filter.remove(dimension.expression);
    }
  }

  onSearchChange(text: string) {
    var { searchText, dataset, fetchQueued, loading } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

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

  onValueClick(value: any, e: MouseEvent) {
    var { selectedValues, colors } = this.state;
    if (colors) {
      colors = colors.toggle(value);
      selectedValues = selectedValues.toggle(value);
    } else {
      if (e.altKey || e.ctrlKey || e.metaKey) {
        if (selectedValues.contains(value) && selectedValues.size() === 1) {
          selectedValues = Set.EMPTY;
        } else {
          selectedValues = Set.EMPTY.add(value);
        }
      } else {
        selectedValues = selectedValues.toggle(value);
      }
    }

    this.setState({
      selectedValues,
      colors
    });
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, onClose } = this.props;
    var { colors } = this.state;
    clicker.changeFilter(this.constructFilter(), colors);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  actionEnabled() {
    var { essence } = this.props;
    return !essence.filter.equals(this.constructFilter());
  }

  onSelectFilterOption(filterMode: FilterMode) {
    this.setState({filterMode});
  }

  renderTable() {
    var { loading, dataset, error, fetchQueued, searchText, selectedValues, promotedValues, filterMode } = this.state;
    var { dimension } = this.props;

    var rows: Array<JSX.Element> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var promotedElements = promotedValues ? promotedValues.elements : [];
      var rowData = dataset.data.slice(0, TOP_N).filter((d) => {
        return promotedElements.indexOf(d[dimension.name]) === -1;
      });
      var rowStrings = promotedElements.concat(rowData.map((d) => d[dimension.name]));

      if (searchText) {
        var searchTextLower = searchText.toLowerCase();
        rowStrings = rowStrings.filter((d) => {
          return String(d).toLowerCase().indexOf(searchTextLower) !== -1;
        });
      }

      var checkboxType = filterMode === Filter.EXCLUDED ? 'cross' : 'check';

      rows = rowStrings.map((segmentValue) => {
          var segmentValueStr = String(segmentValue);
          var selected = selectedValues && selectedValues.contains(segmentValue);

          return <div
            className={classNames('row', { 'selected': selected })}
            key={segmentValueStr}
            title={segmentValueStr}
            onClick={this.onValueClick.bind(this, segmentValue)}
          >
            <div className="row-wrapper">
              <Checkbox type={checkboxType as CheckboxType} selected={selected}/>
              <HighlightString className="label" text={segmentValueStr} highlightText={searchText}/>
            </div>
          </div>;
      });
    }

    var message: JSX.Element = null;
    if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
      message = <div className="message">{'No results for "' + searchText + '"'}</div>;
    }

    return <div className={classNames('menu-table', hasMore ? 'has-more' : 'no-more')}>
      <div className="side-by-side">
        <FilterOptionsDropdown
          selectedOption={filterMode}
          onSelectOption={this.onSelectFilterOption.bind(this)}
        />
        <div className="search-box">
          <ClearableInput
            placeholder="Search"
            focusOnMount={true}
            value={searchText}
            onChange={this.onSearchChange.bind(this)}
          />
        </div>
      </div>
      <div className="rows">
        {rows}
        {message}
      </div>
      {error ? <QueryError error={error}/> : null}
      {loading ? <Loader/> : null}
    </div>;
  }

  render() {
    var { dimension } = this.props;
    if (!dimension) return null;

    return <div className="string-filter-menu">
      {this.renderTable()}
      <div className="button-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick.bind(this)} />
      </div>
    </div>;
  }
}
