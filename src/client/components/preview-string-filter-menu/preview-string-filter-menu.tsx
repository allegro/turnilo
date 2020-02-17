/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Set } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad, error, isError, isLoaded, isLoading, loaded, loading } from "../../../common/models/visualization-props/visualization-props";
import { debounceWithPromise } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { previewStringFilterQuery } from "../../../common/utils/query/preview-string-filter-query";
import { SEARCH_WAIT, STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { Button } from "../button/button";
import { ClearableInput } from "../clearable-input/clearable-input";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import { PreviewList } from "./preview-list";
import "./preview-string-filter-menu.scss";

function checkRegex(text: string): string {
  try {
    new RegExp(text);
  } catch (e) {
    return e.message;
  }
  return null;
}

const TOP_N = 100;

export type PreviewFilterMode = FilterMode.CONTAINS | FilterMode.REGEX;

export interface PreviewStringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  onClose: Fn;
  filterMode: FilterMode.REGEX | FilterMode.CONTAINS;
  onClauseChange: (clause: FilterClause) => Filter;
}

export interface PreviewStringFilterMenuState {
  searchText: string;
  dataset: DatasetLoad;
}

interface QueryProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  filterMode: PreviewFilterMode;
}

export class PreviewStringFilterMenu extends React.Component<PreviewStringFilterMenuProps, PreviewStringFilterMenuState> {
  private lastSearchText: string;

  initialSearchText = (): string => {
    const { essence, dimension } = this.props;
    const clause = essence.filter.getClauseForDimension(dimension);
    if (clause && clause instanceof StringFilterClause && clause.action !== StringFilterAction.IN) {
      return clause.values.first();
    }
    return "";
  };

  state: PreviewStringFilterMenuState = { dataset: loading, searchText: this.initialSearchText() };

  updateSearchText = (searchText: string) => this.setState({ searchText });

  private loadRows() {
    if (this.regexErrorMessage()) return;
    this.setState({ dataset: loading });
    this.sendQueryFilter()
      .then(dataset => {
        // TODO: encode it better
        // null is here when we get out of order request, so we just ignore it
        if (!dataset) return;
        this.setState({ dataset });
      });
  }

  private sendQueryFilter(): Promise<DatasetLoad> {
    const { searchText } = this.state;
    this.lastSearchText = searchText;
    return this.debouncedQueryFilter({ ...this.props, searchText });
  }

  private regexErrorMessage(): string {
    const { filterMode } = this.props;
    const { searchText } = this.state;
    return filterMode === FilterMode.REGEX && searchText && checkRegex(searchText);
  }

  private queryFilter = (props: QueryProps): Promise<DatasetLoad> => {
    const { essence } = props;
    const { searchText } = this.state;
    const query = previewStringFilterQuery({ ...props, searchText, limit: TOP_N + 1 });

    return essence.dataCube.executor(query, { timezone: essence.timezone })
      .then((dataset: Dataset) => {
        if (this.lastSearchText !== searchText) return null;
        return loaded(dataset);
      })
      .catch(err => {
          if (this.lastSearchText !== searchText) return null;
          reportError(err);
          return error(err);
        }
      );
  };

  private debouncedQueryFilter = debounceWithPromise(this.queryFilter, SEARCH_WAIT);

  componentWillMount() {
    this.loadRows();
  }

  componentWillUnmount() {
    this.debouncedQueryFilter.cancel();
  }

  componentDidUpdate(prevProps: PreviewStringFilterMenuProps, prevState: PreviewStringFilterMenuState): void {
    if (this.state.searchText !== prevState.searchText) {
      this.loadRows();
    }
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (enterKey(e)) {
      this.onOkClick();
    }
  };

  constructFilter(): Filter {
    const { dimension, filterMode, onClauseChange } = this.props;
    const { searchText } = this.state;
    if (!searchText) return null;
    const { name: reference } = dimension;

    switch (filterMode) {
      case FilterMode.CONTAINS:
        return onClauseChange(new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.CONTAINS
        }));
      case FilterMode.REGEX:
        return onClauseChange(new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.MATCH
        }));
    }
  }

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  };

  onCancelClick = () => {
    this.props.onClose();
  };

  actionEnabled() {
    const { essence } = this.props;
    if (this.regexErrorMessage()) return false;
    const filter = this.constructFilter();
    return filter && !essence.filter.equals(filter);
  }

  render() {
    const { filterMode, dimension } = this.props;
    const { dataset, searchText } = this.state;

    const hasMore = isLoaded(dataset) && dataset.dataset.data.length > TOP_N;
    return <React.Fragment>
      <GlobalEventListener keyDown={this.globalKeyDownListener} />
      <div className="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={this.updateSearchText}
        />
      </div>
      <div className="preview-string-filter-menu">
        <div className={classNames("menu-table", hasMore ? "has-more" : "no-more")}>
          <div className="rows">
            {isLoaded(dataset) && <PreviewList
              dimension={dimension}
              dataset={dataset.dataset}
              searchText={searchText}
              regexErrorMessage={this.regexErrorMessage()}
              limit={TOP_N}
              filterMode={filterMode} />}
            {isError(dataset) ? <QueryError error={dataset.error} /> : null}
            {isLoading(dataset) ? <Loader /> : null}
          </div>
        </div>
        <div className="ok-cancel-bar">
          <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.actionEnabled()} />
          <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick} />
        </div>
      </div>
    </React.Fragment>;
  }
}
