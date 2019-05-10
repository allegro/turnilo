/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad, isError, isLoaded, isLoading, loaded, loading } from "../../../common/models/visualization-props/visualization-props";
import { debounceWithPromise } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { constructQuery } from "../../../common/utils/query/string-filter-query";
import { SEARCH_WAIT, STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { Button } from "../button/button";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import { RowsList } from "./rows-list";
import "./selectable-string-filter-menu.scss";

const TOP_N = 100;

export interface SelectableStringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  onClose: Fn;
  filterMode?: FilterMode;
  searchText: string;
  onClauseChange: (clause: FilterClause) => Filter;
}

export interface SelectableStringFilterMenuState {
  dataset: DatasetLoad;
  selectedValues?: Set<string>;
  colors?: Colors;
}

function toggle(set: Set<string>, value: string): Set<string> {
  return set.has(value) ? set.remove(value) : set.add(value);
}

export class SelectableStringFilterMenu extends React.Component<SelectableStringFilterMenuProps, SelectableStringFilterMenuState> {
  private lastSearchText: string;

  constructor(props: SelectableStringFilterMenuProps) {
    super(props);
    this.state = {
      dataset: loading,
      selectedValues: null,
      colors: null
    };
  }

  private loadRows(essence: Essence, timekeeper: Timekeeper, dimension: Dimension, searchText: string) {
    this.setState({ dataset: loading });
    this.sendQueryFilter(essence, timekeeper, dimension, searchText)
      .then(dataset => {
        // TODO: encode it better
        // null is here when we get out of order request, so we just ignore it
        if (!dataset) return;
        this.setState({ dataset });
      });
  }

  private sendQueryFilter(essence: Essence, timekeeper: Timekeeper, dimension: Dimension, searchText: string) {
    this.lastSearchText = searchText;
    return this.debouncedQueryFilter(essence, timekeeper, dimension, searchText);
  }

  private queryFilter = (essence: Essence, timekeeper: Timekeeper, dimension: Dimension, searchText: string): Promise<DatasetLoad> => {
    const query = constructQuery(essence, timekeeper, dimension, searchText, TOP_N + 1);

    return essence.dataCube.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (this.lastSearchText !== searchText) return null;
          return loaded(dataset);
        },
        error => {
          if (this.lastSearchText !== searchText) return null;
          reportError(error);
          return error(error);
        }
      );
  }

  private debouncedQueryFilter = debounceWithPromise(this.queryFilter, SEARCH_WAIT);

  componentWillMount() {
    const { essence, timekeeper, searchText, dimension } = this.props;
    const { colors } = essence;

    const hasColors = colors && colors.dimension === dimension.name;
    const valuesFromColors = (hasColors ? Set(colors.toArray()) : Set.of());
    const selectedValues = this.initialSelection() || valuesFromColors;
    this.setState({ selectedValues, colors });

    this.loadRows(essence, timekeeper, dimension, searchText);
  }

  private initialSelection(): Set<string> | null {
    const { essence: { filter }, dimension } = this.props;
    const clause = filter.getClauseForDimension(dimension);
    if (!clause) return null;
    if (!(clause instanceof StringFilterClause)) {
      throw new Error(`Expected string filter clause, got: ${clause}`);
    }
    return clause.action === StringFilterAction.IN && clause.values;
  }

  componentWillUnmount() {
    this.debouncedQueryFilter.cancel();
  }

  componentWillReceiveProps({ essence, timekeeper, dimension, searchText }: SelectableStringFilterMenuProps) {
    this.loadRows(essence, timekeeper, dimension, searchText);
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    const { dimension, filterMode, onClauseChange } = this.props;
    const { selectedValues } = this.state;
    const { name } = dimension;
    if (selectedValues.count() === 0) return onClauseChange(null);

    const clause = new StringFilterClause({
      action: StringFilterAction.IN,
      reference: name,
      values: selectedValues,
      not: filterMode === FilterMode.EXCLUDE
    });
    return onClauseChange(clause);
  }

  onValueClick = (value: string, e: React.MouseEvent<HTMLDivElement>) => {
    const { selectedValues, colors: oldColors } = this.state;
    const colors = oldColors && oldColors.toggle(value);
    if (e.altKey || e.ctrlKey || e.metaKey) {
      const isValueSingleSelected = selectedValues.contains(value) && selectedValues.count() === 1;
      return this.setState({ colors, selectedValues: isValueSingleSelected ? Set.of() : Set.of(value) });
    }
    return this.setState({ colors, selectedValues: toggle(selectedValues, value) });
  }

  onOkClick = () => {
    if (!this.hasFilterChanged()) return;
    const { clicker, onClose } = this.props;
    const { colors } = this.state;
    clicker.changeFilter(this.constructFilter(), colors);
    onClose();
  }

  hasFilterChanged() {
    return !this.props.essence.filter.equals(this.constructFilter());
  }

  render() {
    const { filterMode, onClose, dimension, searchText } = this.props;
    const { dataset, selectedValues } = this.state;

    const hasMore = isLoaded(dataset) && dataset.dataset.data.length > TOP_N;
    return <div className={classNames("string-filter-menu", filterMode)}>
      <GlobalEventListener keyDown={this.globalKeyDownListener} />
      <div className={classNames("menu-table", hasMore ? "has-more" : "no-more")}>
        <div className="rows">
          {isLoaded(dataset) && <RowsList
            onRowSelect={this.onValueClick}
            dimension={dimension}
            dataset={dataset.dataset}
            searchText={searchText}
            limit={TOP_N}
            selectedValues={selectedValues}
            filterMode={filterMode} />}
          {isError(dataset) && <QueryError error={dataset.error} />}
          {isLoading(dataset) && <Loader />}
        </div>
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.hasFilterChanged()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={onClose} />
      </div>
    </div>;
  }
}
