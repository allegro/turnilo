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
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
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
import { PasteForm } from "../paste-form/paste-form";
import { QueryError } from "../query-error/query-error";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./selectable-string-filter-menu.scss";
import { StringValuesList } from "./string-values-list";

const TOP_N = 100;

export interface SelectableStringFilterMenuProps {
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  onClose: Fn;
  filterMode?: FilterMode;
  saveClause: Unary<FilterClause, void>;
}

export interface SelectableStringFilterMenuState {
  searchText: string;
  dataset: DatasetRequest;
  selectedValues: Set<string>;
  pasteModeEnabled: boolean;
}

function toggle(set: Set<string>, value: string): Set<string> {
  return set.has(value) ? set.remove(value) : set.add(value);
}

export class SelectableStringFilterMenu extends React.Component<SelectableStringFilterMenuProps, SelectableStringFilterMenuState> {
  static contextType = ApiContext;

  context: ApiContextValue;
  private lastSearchText: string;

  state: SelectableStringFilterMenuState = {
    pasteModeEnabled: false,
    dataset: loading,
    selectedValues: this.initialSelection(),
    searchText: ""
  };

  private loadRows() {
    this.setState({ dataset: loading });
    this.sendQueryFilter()
      .then(dataset => {
        // TODO: encode it better
        // null is here when we get out of order request, so we just ignore it
        if (!dataset) return;
        this.setState({ dataset });
      })
      .catch(_ => {
        // Some weird internal error. All application logic errors are handled earlier
        this.setState({ dataset: error(new Error("Unknown error")) });
      });
  }

  private sendQueryFilter(): Promise<DatasetRequest> {
    const { searchText } = this.state;
    this.lastSearchText = searchText;
    return this.debouncedQueryFilter(this.props.essence, this.constructSearchTextClause());
  }

  private queryFilter = (essence: Essence, clause: StringFilterClause): Promise<DatasetRequest> => {
    const { searchText } = this.state;
    const { stringFilterQuery } = this.context;

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

  private initialSelection(): Set<string> {
    const { essence: { filter }, dimension } = this.props;
    const clause = filter.getClauseForDimension(dimension);
    if (!clause) return Set();
    if (!(clause instanceof StringFilterClause)) {
      throw new Error(`Expected string filter clause, got: ${clause}`);
    }
    return clause.action === StringFilterAction.IN ? clause.values : Set();
  }

  componentWillUnmount() {
    this.debouncedQueryFilter.cancel();
  }

  componentDidUpdate(prevProps: SelectableStringFilterMenuProps, prevState: SelectableStringFilterMenuState) {
    if (this.state.searchText !== prevState.searchText) {
      this.loadRows();
    }
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!this.state.pasteModeEnabled && enterKey(e)) {
      this.onOkClick();
    }
  };

  updateSearchText = (searchText: string) => this.setState({ searchText });

  constructClause(): StringFilterClause {
    const { dimension, filterMode } = this.props;
    const { selectedValues } = this.state;
    const { name } = dimension;
    if (selectedValues.isEmpty()) return null;

    return new StringFilterClause({
      action: StringFilterAction.IN,
      reference: name,
      values: selectedValues,
      not: filterMode === FilterMode.EXCLUDE
    });
  }

  constructSearchTextClause(): StringFilterClause {
    const { dimension } = this.props;
    const { name: reference } = dimension;
    const { searchText } = this.state;
    return new StringFilterClause({
      action: StringFilterAction.CONTAINS,
      reference,
      values: Set.of(searchText),
      ignoreCase: true
    });
  }

  onValueClick = (value: string, withModKey: boolean) => {
    const { selectedValues } = this.state;
    if (withModKey) {
      const isValueSingleSelected = selectedValues.contains(value) && selectedValues.count() === 1;
      return this.setState({ selectedValues: isValueSingleSelected ? Set.of() : Set.of(value) });
    }
    return this.setState({ selectedValues: toggle(selectedValues, value) });
  };

  onOkClick = () => {
    if (!this.isFilterValid()) return;
    const { saveClause, onClose } = this.props;
    saveClause(this.constructClause());
    onClose();
  };

  enablePasteMode = () => this.setState({ pasteModeEnabled: true });

  disablePasteMode = () => this.setState({ pasteModeEnabled: false });

  selectValues = (values: Set<string>) => this.setState({ selectedValues: values });

  isFilterValid(): boolean {
    const { selectedValues } = this.state;
    if (selectedValues.isEmpty()) return false;
    const { essence: { filter }, dimension } = this.props;
    const newClause = this.constructClause();
    const oldClause = filter.getClauseForDimension(dimension);
    return newClause && !newClause.equals(oldClause);
  }

  renderSelectMode(): JSX.Element {
    const { filterMode, onClose, dimension } = this.props;
    const { dataset, selectedValues, searchText } = this.state;

    return <React.Fragment>
      <div className="paste-icon" onClick={this.enablePasteMode} title="Paste multiple values">
        <SvgIcon svg={require("../../icons/full-multi.svg")} />
      </div>
      <div className="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={this.updateSearchText}
        />
      </div>
      <div className={classNames("selectable-string-filter-menu", filterMode)}>
        <div className="menu-table">
          <div className="rows">
            {isLoaded(dataset) && <StringValuesList
              onRowSelect={this.onValueClick}
              dimension={dimension}
              dataset={dataset.dataset}
              searchText={searchText}
              selectedValues={selectedValues}
              promotedValues={this.initialSelection()}
              filterMode={filterMode} />}
            {isError(dataset) && <QueryError error={dataset.error} />}
            {isLoading(dataset) && <Loader />}
          </div>
        </div>
        <div className="ok-cancel-bar">
          <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.isFilterValid()} />
          <Button type="secondary" title={STRINGS.cancel} onClick={onClose} />
        </div>
      </div>
    </React.Fragment>;
  }

  renderImportMode(): JSX.Element {
    return <React.Fragment>
      <div className="paste-prompt">Paste values separated by newlines</div>
      <div className="paste-form">
        <PasteForm onSelect={this.selectValues} onClose={this.disablePasteMode} />
      </div>
    </React.Fragment>;
  }

  render() {
    const { pasteModeEnabled } = this.state;
    return <React.Fragment>
      <GlobalEventListener keyDown={this.globalKeyDownListener} />
      {pasteModeEnabled ? this.renderImportMode() : this.renderSelectMode()}
    </React.Fragment>;
  }
}
