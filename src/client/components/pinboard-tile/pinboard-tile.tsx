/*
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
import { Dataset, Datum } from "plywood";
import React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
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
  BooleanFilterClause,
  StringFilterAction,
  StringFilterClause
} from "../../../common/models/filter-clause/filter-clause";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { SortDirection } from "../../../common/models/sort/sort";
import { Split } from "../../../common/models/split/split";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { debounceWithPromise, Unary } from "../../../common/utils/functional/functional";
import { MAX_SEARCH_LENGTH } from "../../config/constants";
import { setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { ApiContext, ApiContextValue } from "../../views/cube-view/api-context";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { PinboardDataset } from "./pinboard-dataset";
import { pinboardIcons } from "./pinboard-icons";
import "./pinboard-tile.scss";
import { isClauseEditable } from "./utils/is-clause-editable";
import { isDimensionPinnable } from "./utils/is-dimension-pinnable";
import { isPinnableClause, PinnableClause } from "./utils/pinnable-clause";
import { equalParams, QueryParams } from "./utils/query-params";
import { EditState, RowMode, RowModeId } from "./utils/row-mode";
import { shouldFetchData } from "./utils/should-fetch";
import { tileStyles } from "./utils/tile-styles";

export class PinboardTileProps {
  essence: Essence;
  clicker: Clicker;
  dimension: Dimension;
  timekeeper: Timekeeper;
  refreshRequestTimestamp: number;
  sortOn: SortOn;
}

export interface PinboardTileState {
  searchText: string;
  showSearch: boolean;
  datasetLoad: DatasetRequest;
}

export class PinboardTile extends React.Component<PinboardTileProps, PinboardTileState> {
  static contextType = ApiContext;

  context: ApiContextValue;

  state: PinboardTileState = {
    searchText: "",
    showSearch: false,
    datasetLoad: loading
  };

  private loadData() {
    this.setState({ datasetLoad: loading });
    this.fetchData(this.constructQueryParams())
      .then(loadedDataset => {
        // TODO: encode it better
        // null is here when we get out of order request, so we just ignore it
        if (!loadedDataset) return;
        this.setState({ datasetLoad: loadedDataset });
      });
  }

  private fetchData(params: QueryParams): Promise<DatasetRequest | null> {
    this.lastQueryParams = params;
    return this.debouncedCallExecutor(params);
  }

  private lastQueryParams: Partial<QueryParams> = {};

  private callExecutor = (params: QueryParams): Promise<DatasetRequest | null> => {
    const { essence, clause, split } = params;
    const { pinboardQuery } = this.context;
    return pinboardQuery(essence, clause, split)
      .then((dataset: Dataset) => {
          // signal out of order requests with null
          if (!equalParams(params, this.lastQueryParams)) return null;
          return loaded(dataset);
        },
        err => {
          // signal out of order requests with null
          if (!equalParams(params, this.lastQueryParams)) return null;
          reportError(err);
          return error(err);
        });
  };

  private debouncedCallExecutor = debounceWithPromise(this.callExecutor, 500);

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.debouncedCallExecutor.cancel();
  }

  componentDidUpdate(previousProps: PinboardTileProps, previousState: PinboardTileState) {
    if (shouldFetchData(this.props, previousProps, this.state, previousState)) {
      this.loadData();
    }
  }

  onDragStart = (e: React.DragEvent<HTMLElement>) => {
    const { dimension } = this.props;

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", dimension.title);

    DragManager.setDragDimension(dimension);
    setDragGhost(dataTransfer, dimension.title);
  };

  toggleSearch = () => {
    this.setState(({ showSearch }) => ({ showSearch: !showSearch }));
    this.setSearchText("");
  };

  setSearchText = (text: string) => {
    const searchText = text.substr(0, MAX_SEARCH_LENGTH);
    this.setState({ searchText });
  };

  constructQueryParams(): QueryParams {
    const { sortOn, essence, dimension } = this.props;
    const split = new Split({
      reference: dimension.name,
      sort: sortOn.toSort(SortDirection.descending),
      // TODO: magic number
      limit: 100
    });
    return {
      clause: this.constructSearchTextClause(),
      essence,
      split
    };
  }

  constructSearchTextClause(): StringFilterClause | null {
    const { dimension } = this.props;
    switch (dimension.kind) {
      case "boolean":
        return null;
      case "string":
        const { name: reference } = dimension;
        const { searchText } = this.state;
        return new StringFilterClause({
          action: StringFilterAction.CONTAINS,
          reference,
          values: Set.of(searchText)
        });
      default:
        throw new Error(`Expected String or Boolean dimension kind, got ${dimension.kind}`);
    }
  }

  private getFormatter(): Unary<Datum, string> {
    const { sortOn, essence } = this.props;
    const series = essence.findConcreteSeries(sortOn.key);
    return d => series.formatValue(d);
  }

  private isEditable(): boolean {
    const clause = this.pinnedClause();
    return clause ? isClauseEditable(clause) : isDimensionPinnable(this.props.dimension);
  }

  private isInEdit(): boolean {
    const clause = this.pinnedClause();
    return clause && isClauseEditable(clause) && !clause.values.isEmpty();
  }

  private pinnedClause(): PinnableClause | null {
    const { essence: { filter }, dimension } = this.props;
    const clause = filter.getClauseForDimension(dimension);
    if (isPinnableClause(clause)) return clause;
    return null;
  }

  private addClause(clause: PinnableClause) {
    const { clicker, essence: { filter } } = this.props;
    clicker.changeFilter(filter.addClause(clause));
  }

  private removeClause(clause: PinnableClause) {
    const { clicker, essence: { filter } } = this.props;
    clicker.changeFilter(filter.removeClause(clause.reference));
  }

  private updateClause(clause: PinnableClause) {
    const { clicker, essence: { filter } } = this.props;
    clicker.changeFilter(filter.setClause(clause));
  }

  unpin = () => {
    const { clicker, dimension } = this.props;
    clicker.unpin(dimension);
  };

  private toggleFilterValue = (value: string) => {
    const clause = this.pinnedClause();
    if (!isPinnableClause(clause)) throw Error(`Expected Boolean or String filter clause, got ${clause}`);
    const updater = (values: Set<string>) => values.has(value) ? values.remove(value) : values.add(value);
    // TODO: call looks the same but typescript distinguish them and otherwise can't find common call signature
    const newClause = clause instanceof StringFilterClause ? clause.update("values", updater) : clause.update("values", updater);
    if (newClause.values.isEmpty()) {
      this.removeClause(newClause);
    } else {
      this.updateClause(newClause);
    }
  };

  private createFilterClause = (value: string) => {
    const { dimension } = this.props;
    const reference = dimension.name;
    const values = Set.of(value);
    const clause = dimension.kind === "string"
      ? new StringFilterClause({ reference, action: StringFilterAction.IN, values })
      : new BooleanFilterClause({ reference, values });
    this.addClause(clause);
  };

  private getRowMode(): RowMode {
    if (this.isInEdit()) {
      return {
        mode: RowModeId.EDITABLE,
        state: EditState.IN_EDIT,
        toggleValue: this.toggleFilterValue,
        clause: this.pinnedClause()
      };
    }
    if (this.isEditable()) {
      return {
        mode: RowModeId.EDITABLE,
        state: EditState.READY,
        createClause: this.createFilterClause
      };
    }
    return { mode: RowModeId.READONLY };
  }

  render() {
    const { dimension } = this.props;
    const { datasetLoad, showSearch, searchText } = this.state;

    return <SearchableTile
      style={tileStyles(datasetLoad)}
      title={dimension.title}
      toggleChangeFn={this.toggleSearch}
      onDragStart={this.onDragStart}
      onSearchChange={this.setSearchText}
      searchText={searchText}
      showSearch={showSearch}
      icons={pinboardIcons({ showSearch, onClose: this.unpin, onSearchClick: this.toggleSearch })}
      className="pinboard-tile">
      {isLoaded(datasetLoad) && <PinboardDataset
        rowMode={this.getRowMode()}
        data={datasetLoad.dataset.data}
        searchText={searchText}
        dimension={dimension}
        formatter={this.getFormatter()}/>}
      {isError(datasetLoad) && <QueryError error={datasetLoad.error} />}
      {isLoading(datasetLoad) && <Loader />}
    </SearchableTile>;
  }
}
