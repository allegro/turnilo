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
import React from "react";
import {
  DatasetRequest,
  error,
  isError,
  isLoaded,
  isLoading,
  loaded,
  loading
} from "../../../common/models/dataset-request/dataset-request";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import {
  FilterClause,
  StringFilterAction,
  StringFilterClause
} from "../../../common/models/filter-clause/filter-clause";
import { FilterMode } from "../../../common/models/filter/filter";
import { debounceWithPromise, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { SEARCH_WAIT, STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { ApiContext, ApiContextValue } from "../../views/cube-view/api-context";
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
  dimension: Dimension;
  essence: Essence;
  onClose: Fn;
  filterMode: FilterMode.REGEX | FilterMode.CONTAINS;
  saveClause: Unary<FilterClause, void>;
}

export interface PreviewStringFilterMenuState {
  searchText: string;
  dataset: DatasetRequest;
}

export class PreviewStringFilterMenu extends React.Component<PreviewStringFilterMenuProps, PreviewStringFilterMenuState> {
  static contextType = ApiContext;

  context: ApiContextValue;

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

  private sendQueryFilter(): Promise<DatasetRequest> {
    const { searchText } = this.state;
    this.lastSearchText = searchText;
    return this.debouncedQueryFilter(this.props.essence, this.constructClause());
  }

  private regexErrorMessage(): string {
    const { filterMode } = this.props;
    const { searchText } = this.state;
    return filterMode === FilterMode.REGEX && searchText && checkRegex(searchText);
  }

  private queryFilter = (essence: Essence, clause: StringFilterClause): Promise<DatasetRequest> => {
    const { stringFilterQuery } = this.context;
    const { searchText } = this.state;

    return stringFilterQuery(essence, clause)
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

  UNSAFE_componentWillMount() {
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

  constructClause(): StringFilterClause {
    const { dimension, filterMode } = this.props;
    const { searchText } = this.state;
    const { name: reference } = dimension;

    switch (filterMode) {
      case FilterMode.CONTAINS:
        return new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.CONTAINS
        });
      case FilterMode.REGEX:
        return new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.MATCH
        });
    }
  }

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { saveClause, onClose } = this.props;
    saveClause(this.constructClause());
    onClose();
  };

  onCancelClick = () => {
    this.props.onClose();
  };

  actionEnabled() {
    const { essence: { filter }, dimension } = this.props;
    if (this.regexErrorMessage()) return false;
    const newClause = this.constructClause();
    if (!newClause.values.first()) {
      return false;
    }
    const oldClause = filter.getClauseForDimension(dimension);
    return !newClause.equals(oldClause);
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
