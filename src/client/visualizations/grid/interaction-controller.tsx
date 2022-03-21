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

import React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { DimensionSort, SeriesSort, Sort, SortDirection } from "../../../common/models/sort/sort";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { ScrollerPart } from "../../components/scroller/scroller";
import { MEASURE_WIDTH, SPACE_LEFT } from "../../components/tabular-scroller/dimensions";
import { measureColumnsCount } from "../../components/tabular-scroller/utils/measure-columns-count";
import { Position, seriesPosition, splitPosition } from "./utils/hover-position";
import { mainSplit } from "./utils/main-split";

interface InteractionsProps {
  handleClick: Ternary<number, number, ScrollerPart, void>;
  setScrollTop: Binary<number, number, void>;
  columnWidth: number;
  scrollTop: number;
}

interface InteractionControllerProps {
  essence: Essence;
  clicker: Clicker;
  stage: Stage;
  children: Unary<InteractionsProps, React.ReactNode>;
  segmentWidth: number;
}

interface InteractionControllerState {
  scrollTop: number;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionControllerState> {

  state: InteractionControllerState = {
    scrollTop: 0
  };

  setScrollTop = (scrollTop: number) => this.setState({ scrollTop });

  private getIdealColumnWidth(): number {
    const { stage, segmentWidth, essence } = this.props;
    const availableWidth = stage.width - SPACE_LEFT - segmentWidth;
    const count = measureColumnsCount(essence);

    return count * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / count;
  }

  private setSortToSeries(series: Series, period: SeriesDerivation) {
    const sort = new SeriesSort({ reference: series.key(), period, direction: SortDirection.descending });
    this.setSort(sort);
  }

  private setSortToDimension(dimension: Dimension) {
    const sort = new DimensionSort({ reference: dimension.name, direction: SortDirection.descending });
    this.setSort(sort);
  }

  private setSort(sort: Sort) {
    const { clicker, essence } = this.props;
    const { splits } = essence;
    const split = mainSplit(essence);
    const newSort = split.sort.equals(sort)
      // NOTE: this type assertion is needed, because set method on DimensionSort and SeriesSort has overspecialised return type
      ? (sort as DimensionSort).set("direction", SortDirection.ascending)
      : sort;
    clicker.changeSplits(splits.replace(split, split.changeSort(newSort)), VisStrategy.KeepAlways);
  }

  calculatePosition(x: number, y: number, part: ScrollerPart): Position {
    const { segmentWidth, essence } = this.props;
    switch (part) {
      case "top-left-corner":
        return splitPosition(x, essence, segmentWidth);
      case "top-gutter":
        return seriesPosition(x, essence, segmentWidth, this.getIdealColumnWidth());
      default:
        return { element: "whitespace" };
    }
  }

  handleClick = (x: number, y: number, part: ScrollerPart) => {
    const position = this.calculatePosition(x, y, part);

    switch (position.element) {
      case "dimension":
        this.setSortToDimension(position.dimension);
        break;
      case "series":
        this.setSortToSeries(position.series, position.period);
        break;
    }
  }

  render() {
    const { children } = this.props;
    const { scrollTop } = this.state;

    return <React.Fragment>
      {children({
        columnWidth: this.getIdealColumnWidth(),
        scrollTop,
        handleClick: this.handleClick,
        setScrollTop: this.setScrollTop
      })}
    </React.Fragment>;
  }

}
