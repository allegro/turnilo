/*
 * Copyright 2017-2021 Allegro.pl
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
import { List } from "immutable";
import { Datum, PseudoDatum } from "plywood";
import React from "react";
import { ReactNode } from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Essence, VisStrategy } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Series } from "../../../../common/models/series/series";
import { SeriesSort, SortDirection } from "../../../../common/models/sort/sort";
import { Stage } from "../../../../common/models/stage/stage";
import { Binary, Nullary, Ternary, Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { ScrollerPart } from "../../../components/scroller/scroller";
import { MEASURE_WIDTH, SEGMENT_WIDTH, SPACE_LEFT } from "../../../components/tabular-scroller/dimensions";
import { measureColumnsCount } from "../../../components/tabular-scroller/utils/measure-columns-count";
import { Highlight } from "../../highlight-controller/highlight";
import { HoverElement, PositionHover, rowPosition, seriesPosition } from "../utils/calculate-hover-position";
import { getFilterFromDatum } from "../utils/filter-for-datum";

interface InteractionsProps {
  handleClick: Ternary<number, number, ScrollerPart, void>;
  setHoverRow: Ternary<number, number, ScrollerPart, void>;
  resetHover: Fn;
  setScrollTop: Binary<number, number, void>;
  columnWidth: number;
  scrollTop: number;
  hoverRow?: Datum;
}

interface InteractionControllerProps {
  essence: Essence;
  clicker: Clicker;
  stage: Stage;
  flatData: PseudoDatum[];
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  highlight: Highlight | null;
  saveHighlight: (clauses: List<FilterClause>, key?: string) => void;
  children: Unary<InteractionsProps, ReactNode>;
  segmentWidth: number;
}

interface InteractionControllerState {
  hoverRow?: Datum;
  scrollTop: number;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionControllerState> {

  state: InteractionControllerState = {
    hoverRow: null,
    scrollTop: 0
  };

  private setSortToSeries(series: Series, period: SeriesDerivation) {
    const { clicker, essence } = this.props;
    const { splits } = essence;
    const commonSort = essence.getCommonSort();
    const reference = series.key();
    const sort = new SeriesSort({ reference, period, direction: SortDirection.descending });
    const sortWithDirection = commonSort && commonSort.equals(sort) ? sort.set("direction", SortDirection.ascending) : sort;
    clicker.changeSplits(splits.changeSort(sortWithDirection), VisStrategy.KeepAlways); // set all to measure
  }

  private highlightRow(datum: Datum) {
    const { essence: { splits }, highlight, saveHighlight, dropHighlight } = this.props;
    const rowHighlight = getFilterFromDatum(splits, datum);

    if (!rowHighlight) return;

    const alreadyHighlighted = highlight !== null && rowHighlight.equals(highlight.clauses);
    if (alreadyHighlighted) {
      dropHighlight();
      return;
    }

    saveHighlight(rowHighlight, null);
  }

  private getIdealColumnWidth(): number {
    const availableWidth = this.props.stage.width - SPACE_LEFT - this.getSegmentWidth();
    const count = measureColumnsCount(this.props.essence);

    return count * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / count;
  }

  private calculateMousePosition(x: number, y: number, part: ScrollerPart): PositionHover {
    const { flatData } = this.props;
    switch (part) {
      case "top-gutter":
        return seriesPosition(x, this.props.essence, this.getSegmentWidth(), this.getIdealColumnWidth());
      case "body":
      case "left-gutter":
        return rowPosition(y, flatData);
      default:
        return { element: HoverElement.WHITESPACE };
    }
  }

  getSegmentWidth(): number {
    const { segmentWidth } = this.props;
    return segmentWidth || SEGMENT_WIDTH;
  }

  setHoverRow = (x: number, y: number, part: ScrollerPart) => {
    const { hoverRow } = this.state;
    const position = this.calculateMousePosition(x, y, part);
    if (position.element === HoverElement.ROW && position.datum !== hoverRow) {
      this.setState({ hoverRow: position.datum });
    }
  };

  resetHover = () => {
    const { hoverRow } = this.state;
    if (hoverRow) {
      this.setState({ hoverRow: null });
    }
  };

  setScrollTop = (scrollTop: number) => this.setState({ scrollTop });

  handleClick = (x: number, y: number, part: ScrollerPart) => {
    const position = this.calculateMousePosition(x, y, part);

    switch (position.element) {
      case HoverElement.HEADER:
        this.setSortToSeries(position.series, position.period);
        break;
      case HoverElement.ROW:
        this.highlightRow(position.datum);
        break;
    }
  };

  render() {
    const { children } = this.props;
    const { hoverRow, scrollTop } = this.state;

    return <React.Fragment>
      {children({
        columnWidth: this.getIdealColumnWidth(),
        hoverRow,
        scrollTop,
        handleClick: this.handleClick,
        resetHover: this.resetHover,
        setHoverRow: this.setHoverRow,
        setScrollTop: this.setScrollTop
      })}
    </React.Fragment>;
  }
}
